/**
 * @fileoverview Visibility Confidence Filter
 * @description Pre-processing gate that classifies each MediaPipe landmark by
 *              its optical-tracking confidence before it enters any algorithmic
 *              pipeline (DTW, Gaussian fitting, Mahalanobis scoring, risk eval).
 *
 * Scientific motivation (DeepMind audit finding):
 *   MediaPipe's monocular RGB model *infers* the Z-axis; it does not measure
 *   it.  Under industrial lighting (metal reflections, shadows, gloves) the
 *   model hallucinates anatomically plausible but physically incorrect
 *   coordinates for occluded landmarks — always with a low `visibility` score.
 *   Without this gate, a Z-axis hallucination of even 2 cm inflates the
 *   Mahalanobis distance by (0.02/σ_z)² per landmark, easily triggering a
 *   false CRITICAL_HALT on every frame.
 *
 * Tier thresholds (calibrated against MediaPipe Hand Landmarker paper, 2022):
 *   TRUSTED  : visibility ≥ 0.70 — full 3-D contribution
 *   PARTIAL  : 0.50 ≤ vis < 0.70 — XY trusted, Z suppressed toward mean
 *   IGNORED  : visibility < 0.50 — landmark excluded from all downstream math
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import type { Landmark } from '../kinetic-engine'

// ─────────────────────────────────────────────────────────────────────────────
// Tier thresholds
// ─────────────────────────────────────────────────────────────────────────────
export const VISIBILITY_TRUSTED  = 0.70
export const VISIBILITY_PARTIAL  = 0.50

// ─────────────────────────────────────────────────────────────────────────────
// Confidence tier enum
// ─────────────────────────────────────────────────────────────────────────────
export type VisibilityTier = 'TRUSTED' | 'PARTIAL' | 'IGNORED'

/**
 * A filtered landmark with an explicit confidence tier and per-axis weights.
 *
 * `weight`   — scalar in [0, 1] for scoring contributions.
 * `zWeight`  — dedicated weight for the Z-axis (≤ weight).
 *              For PARTIAL landmarks, zWeight = 0 to suppress depth hallucinations.
 * `isValid`  — convenience flag: true when the landmark MUST be included.
 *              Callers may still choose to include PARTIAL landmarks with reduced
 *              weight; they must exclude IGNORED landmarks entirely.
 */
export interface FilteredLandmark extends Landmark {
    /** Original index in the 21-landmark MediaPipe array */
    landmarkIndex: number
    /** Raw visibility score from MediaPipe [0, 1] */
    rawVisibility:  number
    /** Resolved confidence tier */
    tier:           VisibilityTier
    /** Scalar contribution weight applied to scoring math [0, 1] */
    weight:         number
    /** Z-axis-specific weight — 0 for PARTIAL to suppress depth hallucinations */
    zWeight:        number
    /** True when tier is TRUSTED or PARTIAL (landmark should enter pipeline) */
    isValid:        boolean
}

/**
 * Frame-level summary produced alongside the per-landmark results.
 * Surfaces to the UI / risk engine without requiring iteration over all 21 landmarks.
 */
export interface FrameFilterResult {
    /** Per-landmark filtered output, length always === input.length */
    landmarks:       FilteredLandmark[]
    /** Count of TRUSTED landmarks */
    trustedCount:    number
    /** Count of PARTIAL landmarks */
    partialCount:    number
    /** Count of IGNORED landmarks */
    ignoredCount:    number
    /** Mean weight across all valid (non-IGNORED) landmarks ∈ [0, 1] */
    meanConfidence:  number
    /**
     * True when the frame is safe to use for scoring.
     * Rule: at least 14/21 landmarks (67 %) must be TRUSTED or PARTIAL,
     * including at minimum 4 of the 5 fingertips.
     */
    isFrameUsable:   boolean
    /**
     * True when Z-axis data is globally unreliable.
     * Rule: more than 7 landmarks are PARTIAL (XY-only).
     * Downstream engines should treat Z deviations as non-penalising.
     */
    suppressZAxis:   boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Fingertip indices (MediaPipe 21-point topology)
// ─────────────────────────────────────────────────────────────────────────────
const FINGERTIP_INDICES = new Set([4, 8, 12, 16, 20])
const MIN_VALID_LANDMARKS  = 14   // 67 % of 21
const MIN_VALID_FINGERTIPS =  4   // out of 5 fingertips

// ─────────────────────────────────────────────────────────────────────────────
// VisibilityFilter
// ─────────────────────────────────────────────────────────────────────────────

export class VisibilityFilter {

    /**
     * Classify a single landmark by its visibility score.
     *
     * Complexity: O(1)
     */
    classifyLandmark(lm: Landmark, index: number): FilteredLandmark {
        const vis = lm.visibility ?? 1.0   // treat missing as fully trusted

        let tier:    VisibilityTier
        let weight:  number
        let zWeight: number

        if (vis >= VISIBILITY_TRUSTED) {
            tier    = 'TRUSTED'
            weight  = 1.0
            zWeight = 1.0
        } else if (vis >= VISIBILITY_PARTIAL) {
            // Linear interpolation: weight ∈ [0.5, 1.0) over [0.50, 0.70)
            // Z-axis suppressed: monocular depth unreliable in this range
            tier    = 'PARTIAL'
            weight  = (vis - VISIBILITY_PARTIAL) / (VISIBILITY_TRUSTED - VISIBILITY_PARTIAL) * 0.5 + 0.5
            zWeight = 0.0
        } else {
            tier    = 'IGNORED'
            weight  = 0.0
            zWeight = 0.0
        }

        return {
            ...lm,
            landmarkIndex: index,
            rawVisibility: vis,
            tier,
            weight,
            zWeight,
            isValid: tier !== 'IGNORED',
        }
    }

    /**
     * Filter an entire frame of 21 landmarks.
     *
     * Complexity: O(L)  where L = 21
     */
    filterFrame(landmarks: Landmark[]): FrameFilterResult {
        const filtered = landmarks.map((lm, i) => this.classifyLandmark(lm, i))

        let trustedCount  = 0
        let partialCount  = 0
        let ignoredCount  = 0
        let weightSum     = 0
        let validCount    = 0
        let validFingertips = 0

        for (const fl of filtered) {
            if      (fl.tier === 'TRUSTED') { trustedCount++;  weightSum += fl.weight; validCount++ }
            else if (fl.tier === 'PARTIAL') { partialCount++;  weightSum += fl.weight; validCount++ }
            else                            { ignoredCount++ }

            if (FINGERTIP_INDICES.has(fl.landmarkIndex) && fl.isValid) {
                validFingertips++
            }
        }

        const meanConfidence = validCount > 0 ? weightSum / validCount : 0
        const isFrameUsable  = validCount >= MIN_VALID_LANDMARKS && validFingertips >= MIN_VALID_FINGERTIPS
        const suppressZAxis  = partialCount > 7

        return {
            landmarks: filtered,
            trustedCount,
            partialCount,
            ignoredCount,
            meanConfidence,
            isFrameUsable,
            suppressZAxis,
        }
    }

    /**
     * Filter a sequence of frames (e.g., a full expert run).
     * Frames that fail `isFrameUsable` are marked but NOT removed —
     * the caller decides whether to interpolate or discard.
     *
     * Complexity: O(N × L)  where N = frames, L = 21
     */
    filterSequence(frames: Landmark[][]): FrameFilterResult[] {
        return frames.map(frame => this.filterFrame(frame))
    }

    /**
     * Extract only the valid (non-IGNORED) landmarks from a filtered frame,
     * substituting the landmark's mean XY and a neutral Z=0 for PARTIAL
     * landmarks when Z-axis suppression is active.
     *
     * Used by: InvariantExtractionEngine, KineticEngine.processFrame
     *
     * @param result          - output of filterFrame()
     * @param fallbackZ       - value to use for Z when zWeight === 0 (default 0)
     */
    toValidLandmarks(
        result: FrameFilterResult,
        fallbackZ = 0
    ): { landmarks: Landmark[]; indices: number[] } {
        const landmarks: Landmark[] = []
        const indices:   number[]   = []

        for (const fl of result.landmarks) {
            if (!fl.isValid) continue
            landmarks.push({
                x:          fl.x,
                y:          fl.y,
                z:          fl.zWeight > 0 ? fl.z : fallbackZ,
                visibility: fl.rawVisibility,
            })
            indices.push(fl.landmarkIndex)
        }

        return { landmarks, indices }
    }

    /**
     * Produce a confidence-weighted copy of a full 21-landmark array.
     *
     * For IGNORED landmarks: replaces coordinates with NaN
     * (callers must guard with Number.isNaN checks).
     *
     * For PARTIAL landmarks: suppresses Z toward fallbackZ.
     *
     * Preserves the original 21-element structure so existing code
     * that indexes landmarks[idx] continues to work.
     *
     * @param result - output of filterFrame()
     */
    toWeightedFrame(result: FrameFilterResult, fallbackZ = 0): Landmark[] {
        return result.landmarks.map(fl => {
            if (!fl.isValid) {
                return { x: NaN, y: NaN, z: NaN, visibility: fl.rawVisibility }
            }
            return {
                x:          fl.x,
                y:          fl.y,
                z:          fl.zWeight > 0 ? fl.z : fallbackZ,
                visibility: fl.rawVisibility,
            }
        })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Module-level singleton — import this in consuming modules
// ─────────────────────────────────────────────────────────────────────────────
export const visibilityFilter = new VisibilityFilter()
