/**
 * @fileoverview Auto-OKEM Generator
 * @description Automatically generates an Operational Knowledge Execution Model (OKEM)
 *              from a SINGLE recording of a specialist narrating while performing.
 *
 * This is the key innovation that enables SCALE:
 *   - Old system: requires 3+ expert recordings → industrial only
 *   - New system: requires 1 recording with narration → anyone can use
 *
 * When a parent says "Assim se troca a lâmpada do carro" while doing it,
 * the system automatically extracts:
 *   - The sequence of steps (from speech pauses + velocity dips)
 *   - The kinematic reference for each step (from aligned motion data)
 *   - Critical landmarks (from spatial variance within each step)
 *   - Temporal bounds (from speech timing)
 *
 * Scientific basis:
 *   Expert performance can be decomposed into a sequence of sub-goals
 *   (Anderson, 1982; Fitts & Posner, 1967). When the expert narrates,
 *   the verbal instructions naturally align with these sub-goals.
 *   This allows single-shot OKEM extraction without requiring
 *   multiple recordings for statistical validation.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import { Landmark } from '../kinetic-engine'
import {
    AudioKinematicBinding,
    AudioKinematicSegment,
    AudioSegment,
    KinematicSnapshot,
    GuidanceStep,
} from './audio-kinematic'
import { audioKinematicEngine } from './audio-kinematic'
import { speechAligner, KinematicPhase } from './speech-aligner'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Auto-generated OKEM from a single recording
 */
export interface AutoOKEM {
    /** Unique identifier */
    id: string
    /** Procedure name (extracted from first speech segment or provided) */
    procedureName: string
    /** Specialist/parent ID */
    specialistId: string
    /** Recording timestamp */
    createdAt: number
    /** Total duration in milliseconds */
    totalDurationMs: number
    /** Number of steps extracted */
    stepCount: number
    /** Ordered steps */
    steps: AutoOKEMStep[]
    /** Global kinematic envelope (mean + std dev across all steps) */
    globalEnvelope: {
        meanDurationMs: number
        stdDevDurationMs: number
        meanVelocity: number
        stdDevVelocity: number
    }
    /** Confidence in the extracted OKEM [0, 1] */
    confidence: number
    /** Warnings about extraction quality */
    warnings: string[]
    /** The original audio-kinematic binding */
    binding: AudioKinematicBinding
}

/**
 * A single step in the auto-generated OKEM
 */
export interface AutoOKEMStep {
    /** Step index (0-based) */
    index: number
    /** Human-readable name (extracted from speech) */
    name: string
    /** Detailed description */
    description: string
    /** Reference kinematic frames for this step */
    referenceFrames: Landmark[][]
    /** Duration in milliseconds */
    durationMs: number
    /** Mean velocity */
    meanVelocity: number
    /** Whether this is a critical step (precision point or warning) */
    isCritical: boolean
    /** Landmarks that are most important for this step */
    criticalLandmarks: number[]
    /** Spatial variance across frames in this step */
    spatialVariance: number
    /** Semantic type from audio */
    semanticType: AudioKinematicSegment['semanticType']
    /** Action verb extracted */
    actionVerb: string
    /** Target object extracted */
    targetObject: string
}

/**
 * Input for generating an OKEM
 */
export interface OKEMGenerationInput {
    /** Procedure name */
    procedureName: string
    /** Specialist/parent ID */
    specialistId: string
    /** Audio samples (energy levels per frame) */
    audioSamples: number[]
    /** Transcribed text segments with timestamps */
    textSegments: AudioSegment[]
    /** Kinematic frames (21 landmarks per frame) */
    kinematicFrames: Landmark[][]
    /** Timestamps for each kinematic frame in ms */
    timestamps: number[]
    /** Recording metadata */
    metadata?: {
        device?: string
        resolution?: { width: number; height: number }
        fps?: number
        language?: string
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FINGERTIP_INDICES = [4, 8, 12, 16, 20]
const MIN_STEP_DURATION_MS = 300
const MAX_STEP_DURATION_MS = 15000
const CRITICAL_VARIANCE_THRESHOLD = 0.15

// ─────────────────────────────────────────────────────────────────────────────
// AutoOKEMGenerator
// ─────────────────────────────────────────────────────────────────────────────

export class AutoOKEMGenerator {

    /**
     * Generates an OKEM from a single recording of a specialist narrating
     * while performing a procedure.
     *
     * Pipeline:
     * 1. Align speech with kinematic phases (SpeechAligner)
     * 2. Create audio-kinematic binding (AudioKinematicEngine)
     * 3. Extract steps from binding
     * 4. Compute kinematic statistics per step
     * 5. Identify critical steps and landmarks
     * 6. Compute global envelope
     * 7. Package as OKEM
     *
     * @param input - The recording data
     * @returns Auto-generated OKEM
     */
    generate(input: OKEMGenerationInput): AutoOKEM {
        const warnings: string[] = []

        // Validate input
        if (input.kinematicFrames.length < 10) {
            throw new Error('Insufficient kinematic data. Need at least 10 frames.')
        }
        if (input.textSegments.length === 0) {
            warnings.push('No text segments provided. Using velocity-based segmentation only.')
        }

        // Step 1: Align speech with kinematic phases
        const alignment = speechAligner.alignRecording(
            input.audioSamples,
            input.kinematicFrames,
            input.timestamps,
            input.textSegments
        )

        if (alignment.overallQuality < 0.5) {
            warnings.push(`Low alignment quality: ${(alignment.overallQuality * 100).toFixed(1)}%. OKEM may be less reliable.`)
        }

        // Step 2: Create audio-kinematic binding
        const metadata = {
            device: input.metadata?.device ?? 'Unknown',
            resolution: input.metadata?.resolution ?? { width: 1920, height: 1080 },
            fps: input.metadata?.fps ?? 30,
            lightingQuality: 'moderate' as const,
            avgLandmarksDetected: 21,
            spokenLanguage: input.metadata?.language ?? 'pt',
        }

        // Convert alignment pairs to kinematic snapshots
        const kinematicSnapshots = this.alignmentToSnapshots(alignment.pairs)

        const binding = audioKinematicEngine.bind(
            input.textSegments.length > 0 ? input.textSegments : this.alignmentToAudioSegments(alignment),
            kinematicSnapshots,
            metadata
        )

        // Step 3: Extract steps
        const steps = this.extractSteps(binding, input.kinematicFrames, input.timestamps)

        // Step 4: Filter invalid steps
        const validSteps = steps.filter(s =>
            s.durationMs >= MIN_STEP_DURATION_MS &&
            s.durationMs <= MAX_STEP_DURATION_MS
        )

        if (validSteps.length < steps.length) {
            warnings.push(`${steps.length - validSteps.length} steps filtered out (too short or too long).`)
        }

        // Step 5: Compute global envelope
        const globalEnvelope = this.computeGlobalEnvelope(validSteps)

        // Step 6: Compute confidence
        const confidence = this.computeConfidence(alignment, validSteps, input.kinematicFrames.length)

        // Step 7: Build OKEM
        const totalDurationMs = input.timestamps[input.timestamps.length - 1] -
                                input.timestamps[0]

        return {
            id: `auto_okem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            procedureName: input.procedureName,
            specialistId: input.specialistId,
            createdAt: Date.now(),
            totalDurationMs,
            stepCount: validSteps.length,
            steps: validSteps,
            globalEnvelope,
            confidence,
            warnings,
            binding,
        }
    }

    /**
     * Generates guidance steps for a learner from an AutoOKEM.
     * This is what the learner's device plays back.
     */
    generateGuidance(okem: AutoOKEM): GuidanceStep[] {
        return okem.steps.map((step, i) => ({
            stepNumber: i + 1,
            instruction: `${step.actionVerb} ${step.targetObject}`.trim() || step.name,
            waitDurationMs: step.durationMs,
            validationLandmarks: step.criticalLandmarks,
            passThreshold: step.isCritical ? 85 : 70,
            isCritical: step.isCritical,
        }))
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private extractSteps(
        binding: AudioKinematicBinding,
        allFrames: Landmark[][],
        allTimestamps: number[]
    ): AutoOKEMStep[] {
        const steps: AutoOKEMStep[] = []

        for (let i = 0; i < binding.segments.length; i++) {
            const seg = binding.segments[i]

            // Find frames in this time window
            const startIdx = this.findFrameIndex(allTimestamps, seg.kinematic.startTimeMs)
            const endIdx = this.findFrameIndex(allTimestamps, seg.kinematic.endTimeMs)
            const stepFrames = allFrames.slice(startIdx, endIdx + 1)

            // Compute statistics
            const durationMs = seg.kinematic.endTimeMs - seg.kinematic.startTimeMs
            const meanVelocity = seg.kinematic.meanVelocity
            const spatialVariance = this.computeSpatialVariance(stepFrames)

            // Determine critical landmarks
            const criticalLandmarks = this.findCriticalLandmarks(stepFrames)

            steps.push({
                index: i,
                name: seg.audio.text.substring(0, 50) || `Step ${i + 1}`,
                description: seg.audio.text,
                referenceFrames: stepFrames.length > 0 ? stepFrames : seg.kinematic.frames,
                durationMs,
                meanVelocity,
                isCritical: seg.kinematic.isPrecisionPoint || seg.semanticType === 'warning',
                criticalLandmarks,
                spatialVariance,
                semanticType: seg.semanticType,
                actionVerb: seg.actionVerb,
                targetObject: seg.targetObject,
            })
        }

        return steps
    }

    private computeSpatialVariance(frames: Landmark[][]): number {
        if (frames.length < 2) return 0

        // Compute mean position for each landmark
        const meanPositions: Landmark[] = []
        for (let l = 0; l < (frames[0]?.length ?? 0); l++) {
            let sumX = 0, sumY = 0, sumZ = 0
            for (const frame of frames) {
                if (l < frame.length) {
                    sumX += frame[l].x
                    sumY += frame[l].y
                    sumZ += frame[l].z
                }
            }
            meanPositions.push({
                x: sumX / frames.length,
                y: sumY / frames.length,
                z: sumZ / frames.length,
            })
        }

        // Compute variance across frames
        let totalVariance = 0
        for (const frame of frames) {
            for (let l = 0; l < frame.length && l < meanPositions.length; l++) {
                const dx = frame[l].x - meanPositions[l].x
                const dy = frame[l].y - meanPositions[l].y
                const dz = frame[l].z - meanPositions[l].z
                totalVariance += dx * dx + dy * dy + dz * dz
            }
        }

        return totalVariance / (frames.length * (frames[0]?.length ?? 1))
    }

    private findCriticalLandmarks(frames: Landmark[][]): number[] {
        if (frames.length < 2) return FINGERTIP_INDICES

        // Find landmarks with highest variance (these are the important ones)
        const variances: Array<{ index: number; variance: number }> = []

        for (let l = 0; l < (frames[0]?.length ?? 0); l++) {
            let sumX = 0, sumY = 0, sumZ = 0
            for (const frame of frames) {
                if (l < frame.length) {
                    sumX += frame[l].x
                    sumY += frame[l].y
                    sumZ += frame[l].z
                }
            }
            const meanX = sumX / frames.length
            const meanY = sumY / frames.length
            const meanZ = sumZ / frames.length

            let variance = 0
            for (const frame of frames) {
                if (l < frame.length) {
                    const dx = frame[l].x - meanX
                    const dy = frame[l].y - meanY
                    const dz = frame[l].z - meanZ
                    variance += dx * dx + dy * dy + dz * dz
                }
            }
            variance /= frames.length

            variances.push({ index: l, variance })
        }

        // Return top 5 landmarks with highest variance
        variances.sort((a, b) => b.variance - a.variance)
        return variances.slice(0, 5).map(v => v.index)
    }

    private computeGlobalEnvelope(steps: AutoOKEMStep[]): AutoOKEM['globalEnvelope'] {
        if (steps.length === 0) {
            return {
                meanDurationMs: 0,
                stdDevDurationMs: 0,
                meanVelocity: 0,
                stdDevVelocity: 0,
            }
        }

        const durations = steps.map(s => s.durationMs)
        const velocities = steps.map(s => s.meanVelocity)

        const meanDurationMs = durations.reduce((a, b) => a + b, 0) / durations.length
        const meanVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length

        const stdDevDurationMs = Math.sqrt(
            durations.reduce((acc, d) => acc + Math.pow(d - meanDurationMs, 2), 0) / durations.length
        )
        const stdDevVelocity = Math.sqrt(
            velocities.reduce((acc, v) => acc + Math.pow(v - meanVelocity, 2), 0) / velocities.length
        )

        return { meanDurationMs, stdDevDurationMs, meanVelocity, stdDevVelocity }
    }

    private computeConfidence(
        alignment: ReturnType<typeof speechAligner.align>,
        steps: AutoOKEMStep[],
        totalFrames: number
    ): number {
        // Factors:
        // 1. Alignment quality (40%)
        // 2. Number of steps (20%) - more steps = more info
        // 3. Step coverage (20%) - how much of the recording is covered
        // 4. Kinematic variance (20%) - low variance = high confidence

        const alignmentScore = alignment.overallQuality
        const stepCountScore = Math.min(1, steps.length / 10)
        const coverageScore = steps.reduce((sum, s) => sum + s.durationMs, 0) / (totalFrames * 33)
        const varianceScore = steps.length > 0
            ? 1 - Math.min(1, steps.reduce((sum, s) => sum + s.spatialVariance, 0) / steps.length)
            : 0

        return Math.min(1, (
            0.4 * alignmentScore +
            0.2 * stepCountScore +
            0.2 * Math.min(1, coverageScore) +
            0.2 * varianceScore
        ))
    }

    private alignmentToSnapshots(
        pairs: Array<{ audio: AudioSegment; kinematic: KinematicSnapshot; overlapMs: number }>
    ): KinematicSnapshot[] {
        return pairs.map(p => p.kinematic)
    }

    private alignmentToAudioSegments(
        alignment: ReturnType<typeof speechAligner.align>
    ): AudioSegment[] {
        return alignment.pairs.map(p => p.audio)
    }

    private findFrameIndex(timestamps: number[], targetMs: number): number {
        let bestIdx = 0
        let bestDiff = Infinity

        for (let i = 0; i < timestamps.length; i++) {
            const diff = Math.abs(timestamps[i] - targetMs)
            if (diff < bestDiff) {
                bestDiff = diff
                bestIdx = i
            }
        }

        return bestIdx
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const autoOKEMGenerator = new AutoOKEMGenerator()
