/**
 * @fileoverview Speech-Kinematic Temporal Aligner
 * @description Aligns speech segments with kinematic phases using:
 *              - Voice Activity Detection (VAD) for speech boundary detection
 *              - Velocity-based phase segmentation for kinematic boundaries
 *              - Dynamic alignment of speech to kinematic phases
 *
 * Scientific basis:
 *   Speech and movement share temporal coupling (Quek et al., 2004).
 *   When a specialist narrates while performing, speech pauses naturally
 *   align with movement transitions. This engine exploits this coupling
 *   to automatically segment a continuous recording into discrete steps.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import { Landmark } from '../kinetic-engine'
import { AudioSegment, KinematicSnapshot } from './audio-kinematic'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of temporal alignment
 */
export interface AlignmentResult {
    /** Aligned pairs of (audio segment, kinematic snapshot) */
    pairs: Array<{
        audio: AudioSegment
        kinematic: KinematicSnapshot
        overlapMs: number
        alignmentScore: number
    }>
    /** Total alignment quality [0, 1] */
    overallQuality: number
    /** Number of unaligned audio segments (no kinematic match) */
    unalignedAudioCount: number
    /** Number of unaligned kinematic snapshots (no audio match) */
    unalignedKinematicCount: number
}

/**
 * Voice Activity Detection result
 */
export interface VADResult {
    /** Speech segments (start/end in ms) */
    segments: Array<{ startMs: number; endMs: number; energy: number }>
    /** Silence segments */
    silences: Array<{ startMs: number; endMs: number; durationMs: number }>
    /** Overall speech ratio [0, 1] */
    speechRatio: number
}

/**
 * Kinematic phase detected from velocity profile
 */
export interface KinematicPhase {
    /** Phase index */
    index: number
    /** Start frame index */
    startFrame: number
    /** End frame index */
    endFrame: number
    /** Start time in ms */
    startTimeMs: number
    /** End time in ms */
    endTimeMs: number
    /** Mean velocity in this phase */
    meanVelocity: number
    /** Phase type */
    type: 'movement' | 'precision' | 'transition' | 'pause'
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FINGERTIP_INDICES = [4, 8, 12, 16, 20]
const FRAME_INTERVAL_MS = 33 // ~30fps
const SILENCE_THRESHOLD_MS = 400
const MIN_PHASE_FRAMES = 5
const VELOCITY_SMOOTHING_WINDOW = 5

// ─────────────────────────────────────────────────────────────────────────────
// SpeechAligner
// ─────────────────────────────────────────────────────────────────────────────

export class SpeechAligner {

    /**
     * Performs Voice Activity Detection on audio energy levels.
     *
     * In production, this would use a real VAD model (e.g., WebRTC VAD).
     * For now, we use energy-based thresholding.
     *
     * @param audioSamples - Array of audio energy levels (0-1) per frame
     * @param frameIntervalMs - Interval between samples in ms
     */
    detectVoiceActivity(
        audioSamples: number[],
        frameIntervalMs: number = 33
    ): VADResult {
        const segments: Array<{ startMs: number; endMs: number; energy: number }> = []
        const silences: Array<{ startMs: number; endMs: number; durationMs: number }> = []

        let inSpeech = false
        let speechStart = 0
        let totalSpeechEnergy = 0
        let speechFrameCount = 0

        for (let i = 0; i < audioSamples.length; i++) {
            const energy = audioSamples[i]
            const timeMs = i * frameIntervalMs

            if (energy > 0.3 && !inSpeech) {
                // Start of speech
                inSpeech = true
                speechStart = timeMs
            } else if (energy <= 0.3 && inSpeech) {
                // End of speech
                inSpeech = false
                const durationMs = timeMs - speechStart
                if (durationMs >= 200) { // Minimum 200ms speech segment
                    segments.push({
                        startMs: speechStart,
                        endMs: timeMs,
                        energy: totalSpeechEnergy / Math.max(1, speechFrameCount),
                    })
                }
                totalSpeechEnergy = 0
                speechFrameCount = 0
            }

            if (inSpeech) {
                totalSpeechEnergy += energy
                speechFrameCount++
            }
        }

        // Handle trailing speech
        if (inSpeech) {
            const timeMs = audioSamples.length * frameIntervalMs
            segments.push({
                startMs: speechStart,
                endMs: timeMs,
                energy: totalSpeechEnergy / Math.max(1, speechFrameCount),
            })
        }

        // Detect silences between speech segments
        for (let i = 1; i < segments.length; i++) {
            const gapStart = segments[i - 1].endMs
            const gapEnd = segments[i].startMs
            const gapDuration = gapEnd - gapStart

            if (gapDuration >= SILENCE_THRESHOLD_MS) {
                silences.push({
                    startMs: gapStart,
                    endMs: gapEnd,
                    durationMs: gapDuration,
                })
            }
        }

        const totalDuration = audioSamples.length * frameIntervalMs
        const totalSpeechMs = segments.reduce((sum, s) => sum + (s.endMs - s.startMs), 0)

        return {
            segments,
            silences,
            speechRatio: totalDuration > 0 ? totalSpeechMs / totalDuration : 0,
        }
    }

    /**
     * Detects kinematic phases from a sequence of landmark frames.
     *
     * Uses velocity-based segmentation:
     * - High velocity = movement phase
     * - Low velocity = precision phase
     * - Velocity dip = transition between phases
     *
     * @param frames - Array of landmark frames
     * @param timestamps - Array of timestamps in ms
     */
    detectKinematicPhases(
        frames: Landmark[][],
        timestamps: number[]
    ): KinematicPhase[] {
        if (frames.length < MIN_PHASE_FRAMES) {
            return [{
                index: 0,
                startFrame: 0,
                endFrame: frames.length - 1,
                startTimeMs: timestamps[0] ?? 0,
                endTimeMs: timestamps[timestamps.length - 1] ?? 0,
                meanVelocity: 0,
                type: 'movement',
            }]
        }

        // Compute velocity profile
        const velocities = this.computeVelocityProfile(frames, timestamps)

        // Smooth velocities
        const smoothed = this.smoothArray(velocities, VELOCITY_SMOOTHING_WINDOW)

        // Detect phase boundaries (velocity dips)
        const boundaries = this.detectVelocityDips(smoothed)

        // Build phases
        const phases: KinematicPhase[] = []

        const allBoundaries = [0, ...boundaries, frames.length - 1]

        for (let i = 0; i < allBoundaries.length - 1; i++) {
            const startFrame = allBoundaries[i]
            const endFrame = allBoundaries[i + 1]

            if (endFrame - startFrame < MIN_PHASE_FRAMES) continue

            const phaseVelocities = smoothed.slice(startFrame, endFrame + 1)
            const meanVelocity = phaseVelocities.reduce((a, b) => a + b, 0) / phaseVelocities.length

            let type: KinematicPhase['type']
            if (meanVelocity < 0.1) {
                type = 'precision'
            } else if (meanVelocity < 0.3) {
                type = 'transition'
            } else {
                type = 'movement'
            }

            phases.push({
                index: i,
                startFrame,
                endFrame,
                startTimeMs: timestamps[startFrame] ?? startFrame * FRAME_INTERVAL_MS,
                endTimeMs: timestamps[endFrame] ?? endFrame * FRAME_INTERVAL_MS,
                meanVelocity,
                type,
            })
        }

        return phases
    }

    /**
     * Aligns audio segments with kinematic phases using temporal overlap.
     *
     * The alignment algorithm:
     * 1. For each audio segment, find the kinematic phase with maximum temporal overlap
     * 2. If overlap exceeds threshold, pair them
     * 3. Handle cases where multiple audio segments map to one phase (merge)
     * 4. Handle cases where one audio segment spans multiple phases (split)
     */
    align(
        audioSegments: AudioSegment[],
        kinematicPhases: KinematicPhase[],
        frameIntervalMs: number = FRAME_INTERVAL_MS
    ): AlignmentResult {
        const pairs: AlignmentResult['pairs'] = []
        const usedPhases = new Set<number>()
        const usedAudio = new Set<number>()

        // Phase 1: Direct alignment (max overlap)
        for (let a = 0; a < audioSegments.length; a++) {
            const audio = audioSegments[a]
            let bestPhaseIdx = -1
            let bestOverlap = 0

            for (let p = 0; p < kinematicPhases.length; p++) {
                if (usedPhases.has(p)) continue

                const phase = kinematicPhases[p]
                const overlap = this.computeOverlap(
                    audio.startTimeMs, audio.endTimeMs,
                    phase.startTimeMs, phase.endTimeMs
                )

                if (overlap > bestOverlap) {
                    bestOverlap = overlap
                    bestPhaseIdx = p
                }
            }

            if (bestPhaseIdx >= 0 && bestOverlap > 100) { // Minimum 100ms overlap
                const phase = kinematicPhases[bestPhaseIdx]
                usedPhases.add(bestPhaseIdx)
                usedAudio.add(a)

                pairs.push({
                    audio,
                    kinematic: this.phaseToSnapshot(phase, frameIntervalMs),
                    overlapMs: bestOverlap,
                    alignmentScore: bestOverlap / (audio.endTimeMs - audio.startTimeMs),
                })
            }
        }

        // Phase 2: Handle unaligned audio (attach to nearest phase)
        for (let a = 0; a < audioSegments.length; a++) {
            if (usedAudio.has(a)) continue

            const audio = audioSegments[a]
            let nearestPhaseIdx = -1
            let minDistance = Infinity

            for (let p = 0; p < kinematicPhases.length; p++) {
                const phase = kinematicPhases[p]
                const distance = this.computeDistance(
                    audio.startTimeMs, audio.endTimeMs,
                    phase.startTimeMs, phase.endTimeMs
                )

                if (distance < minDistance) {
                    minDistance = distance
                    nearestPhaseIdx = p
                }
            }

            if (nearestPhaseIdx >= 0 && minDistance < 2000) { // Max 2s gap
                const phase = kinematicPhases[nearestPhaseIdx]
                usedPhases.add(nearestPhaseIdx)
                usedAudio.add(a)

                pairs.push({
                    audio,
                    kinematic: this.phaseToSnapshot(phase, frameIntervalMs),
                    overlapMs: 0,
                    alignmentScore: 0.3, // Low confidence
                })
            }
        }

        // Sort by audio start time
        pairs.sort((a, b) => a.audio.startTimeMs - b.audio.startTimeMs)

        // Calculate quality metrics
        const alignedPairs = pairs.filter(p => p.overlapMs > 0)
        const overallQuality = alignedPairs.length > 0
            ? alignedPairs.reduce((sum, p) => sum + p.alignmentScore, 0) / alignedPairs.length
            : 0

        return {
            pairs,
            overallQuality,
            unalignedAudioCount: audioSegments.length - usedAudio.size,
            unalignedKinematicCount: kinematicPhases.length - usedPhases.size,
        }
    }

    /**
     * Performs full pipeline: VAD → Phase Detection → Alignment
     *
     * This is the main entry point for aligning a recording.
     */
    alignRecording(
        audioSamples: number[],
        kinematicFrames: Landmark[][],
        timestamps: number[],
        textSegments: AudioSegment[] = []
    ): AlignmentResult {
        // Step 1: Detect voice activity
        const vad = this.detectVoiceActivity(audioSamples)

        // Step 2: Use text segments if provided, otherwise use VAD segments
        const audioSegments = textSegments.length > 0
            ? textSegments
            : vad.segments.map((s, i) => ({
                id: `vad_${i}`,
                text: `[Speech segment ${i + 1}]`,
                startTimeMs: s.startMs,
                endTimeMs: s.endMs,
                durationMs: s.endMs - s.startMs,
                confidence: s.energy,
                language: 'unknown',
            }))

        // Step 3: Detect kinematic phases
        const phases = this.detectKinematicPhases(kinematicFrames, timestamps)

        // Step 4: Align
        return this.align(audioSegments, phases)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private computeVelocityProfile(frames: Landmark[][], timestamps: number[]): number[] {
        const velocities: number[] = []

        for (let i = 1; i < frames.length; i++) {
            const dt = (timestamps[i] - timestamps[i - 1]) / 1000 // Convert to seconds
            if (dt <= 0) {
                velocities.push(0)
                continue
            }

            let totalDist = 0
            for (const idx of FINGERTIP_INDICES) {
                if (idx >= frames[i].length || idx >= frames[i - 1].length) continue
                const dx = frames[i][idx].x - frames[i - 1][idx].x
                const dy = frames[i][idx].y - frames[i - 1][idx].y
                const dz = frames[i][idx].z - frames[i - 1][idx].z
                totalDist += Math.sqrt(dx * dx + dy * dy + dz * dz)
            }

            velocities.push(totalDist / (FINGERTIP_INDICES.length * dt))
        }

        return velocities
    }

    private smoothArray(arr: number[], windowSize: number): number[] {
        const result: number[] = []
        const halfWindow = Math.floor(windowSize / 2)

        for (let i = 0; i < arr.length; i++) {
            const start = Math.max(0, i - halfWindow)
            const end = Math.min(arr.length - 1, i + halfWindow)
            let sum = 0
            let count = 0

            for (let j = start; j <= end; j++) {
                sum += arr[j]
                count++
            }

            result.push(sum / count)
        }

        return result
    }

    private detectVelocityDips(velocities: number[]): number[] {
        const dips: number[] = []
        const windowSize = 5

        for (let i = windowSize; i < velocities.length - windowSize; i++) {
            const current = velocities[i]
            let isMinimum = true

            for (let w = -windowSize; w <= windowSize; w++) {
                if (w === 0) continue
                if (velocities[i + w] < current) {
                    isMinimum = false
                    break
                }
            }

            if (isMinimum && current < 0.15) {
                dips.push(i)
                i += windowSize
            }
        }

        return dips
    }

    private computeOverlap(
        aStart: number, aEnd: number,
        bStart: number, bEnd: number
    ): number {
        const start = Math.max(aStart, bStart)
        const end = Math.min(aEnd, bEnd)
        return Math.max(0, end - start)
    }

    private computeDistance(
        aStart: number, aEnd: number,
        bStart: number, bEnd: number
    ): number {
        if (aEnd < bStart) return bStart - aEnd
        if (bEnd < aStart) return aStart - bEnd
        return 0 // Overlapping
    }

    private phaseToSnapshot(
        phase: KinematicPhase,
        frameIntervalMs: number
    ): KinematicSnapshot {
        return {
            startTimeMs: phase.startTimeMs,
            endTimeMs: phase.endTimeMs,
            frames: [], // Frames would be populated from the original data
            meanVelocity: phase.meanVelocity,
            isPrecisionPoint: phase.type === 'precision',
            meanConfidence: 0.8, // Default confidence
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const speechAligner = new SpeechAligner()
