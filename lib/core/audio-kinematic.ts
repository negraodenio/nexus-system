/**
 * @fileoverview Audio-Kinematic Binding Engine
 * @description Binds verbal narration with kinematic capture in real-time.
 *              When a specialist NARRATES while PERFORMING, this engine:
 *              - Aligns speech segments with kinematic phases
 *              - Extracts temporal boundaries for each verbal instruction
 *              - Generates OKEM from a SINGLE recording (not 3+)
 *              - Produces audio guidance for learners
 *
 * Scientific basis:
 *   Human motor learning is enhanced when verbal instructions are temporally
 *   aligned with visual/kinesthetic demonstration (Bandura, 1986; Shea & Morgan, 1979).
 *   The "audio-kinematic binding" creates a multimodal OKEM that is:
 *   - More robust than kinematic-only (handles occlusion, Z-axis ambiguity)
 *   - More natural than text-only (preserves temporal context)
 *   - More transferable than video-only (extracts structured knowledge)
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import { Landmark } from '../kinetic-engine'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single verbal instruction aligned with kinematic data
 */
export interface AudioSegment {
    /** Unique identifier for this segment */
    id: string
    /** Transcribed text from the specialist's narration */
    text: string
    /** Start timestamp in milliseconds (relative to recording start) */
    startTimeMs: number
    /** End timestamp in milliseconds */
    endTimeMs: number
    /** Duration in milliseconds */
    durationMs: number
    /** Confidence of speech recognition [0, 1] */
    confidence: number
    /** Language detected (e.g., 'pt', 'en', 'es') */
    language: string
}

/**
 * Kinematic snapshot aligned to a specific time window
 */
export interface KinematicSnapshot {
    /** Start timestamp in milliseconds */
    startTimeMs: number
    /** End timestamp in milliseconds */
    endTimeMs: number
    /** Landmark frames captured in this window */
    frames: Landmark[][]
    /** Mean velocity across all frames (for phase detection) */
    meanVelocity: number
    /** Whether this is a "precision point" (low velocity, high importance) */
    isPrecisionPoint: boolean
    /** Mean confidence of landmarks in this window */
    meanConfidence: number
}

/**
 * An audio-kinematic segment: verbal instruction + kinematic execution
 */
export interface AudioKinematicSegment {
    /** Unique identifier */
    id: string
    /** Order in the sequence */
    orderIndex: number
    /** Verbal instruction */
    audio: AudioSegment
    /** Aligned kinematic data */
    kinematic: KinematicSnapshot
    /** Semantic category inferred from text + motion */
    semanticType: 'action' | 'warning' | 'description' | 'confirmation'
    /** Extracted action verb (e.g., "fechar", "rodar", "verificar") */
    actionVerb: string
    /** Extracted target object (e.g., "válvula", "vedante", "parafuso") */
    targetObject: string
    /** Extracted parameter (e.g., "15 graus", "3 vezes", "devagar") */
    parameter: string
    /** Overall quality score for this segment [0, 100] */
    qualityScore: number
}

/**
 * Complete audio-kinematic binding for a procedure
 */
export interface AudioKinematicBinding {
    /** Unique identifier */
    id: string
    /** Procedure name */
    procedureName: string
    /** Specialist/parent ID */
    specialistId: string
    /** Recording start timestamp */
    recordingStartMs: number
    /** Recording end timestamp */
    recordingEndMs: number
    /** Total duration in milliseconds */
    totalDurationMs: number
    /** Ordered segments */
    segments: AudioKinematicSegment[]
    /** Raw audio segments (before alignment) */
    rawAudioSegments: AudioSegment[]
    /** Raw kinematic snapshots (before alignment) */
    rawKinematicSnapshots: KinematicSnapshot[]
    /** Metadata about the recording environment */
    metadata: RecordingMetadata
}

/**
 * Metadata about the recording environment
 */
export interface RecordingMetadata {
    /** Device used (e.g., 'iPhone 15 Pro', 'Galaxy S24') */
    device: string
    /** Camera resolution */
    resolution: { width: number; height: number }
    /** Frames per second */
    fps: number
    /** Lighting conditions (inferred from confidence) */
    lightingQuality: 'good' | 'moderate' | 'poor'
    /** Number of landmarks detected per frame (avg) */
    avgLandmarksDetected: number
    /** Language spoken */
    spokenLanguage: string
}

/**
 * Result of generating guidance for a learner
 */
export interface GuidanceStep {
    /** Step number (1-based) */
    stepNumber: number
    /** Verbal instruction to play */
    instruction: string
    /** Duration to wait before next instruction */
    waitDurationMs: number
    /** Landmarks to watch for validation */
    validationLandmarks: number[]
    /** Threshold for passing this step [0, 100] */
    passThreshold: number
    /** Whether this is a critical step (cannot skip) */
    isCritical: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VELOCITY_PRECISION_THRESHOLD = 0.15  // Below this = precision point
const MIN_SEGMENT_DURATION_MS = 500        // Minimum segment duration
const MAX_SEGMENT_DURATION_MS = 10000      // Maximum segment duration
const FINGERTIP_INDICES = [4, 8, 12, 16, 20]

// Action verbs (Portuguese + English) for semantic extraction
const ACTION_VERBS_PT = [
    'fechar', 'abrir', 'rodar', 'roda', 'apertar', 'soltar', 'inserir', 'retirar',
    'verificar', 'medir', 'cortar', 'soldar', 'limpar', 'lavar', 'secar',
    'encaixar', 'desencaixar', 'empurrar', 'puxar', 'levantar', 'baixar',
    'girar', 'enroscar', 'desenroscar', 'fixar', 'soltar', 'ajustar',
    'colocar', 'remover', 'substituir', 'instalar', 'desligar', 'ligar',
    'pressionar', 'carregar', 'arrastar', 'sacudir', 'bater', 'limpar'
]

const ACTION_VERBS_EN = [
    'close', 'open', 'turn', 'press', 'release', 'insert', 'remove',
    'check', 'measure', 'cut', 'weld', 'clean', 'wash', 'dry',
    'fit', 'unfit', 'push', 'pull', 'lift', 'lower',
    'rotate', 'screw', 'unscrew', 'fix', 'loosen', 'adjust',
    'place', 'remove', 'replace', 'install', 'disconnect', 'connect',
    'press', 'load', 'drag', 'shake', 'hit', 'clean'
]

const WARNING_WORDS_PT = ['cuidado', 'atenção', 'não', 'nunca', 'perigo', 'risco', 'importante']
const WARNING_WORDS_EN = ['careful', 'attention', 'do not', 'never', 'danger', 'risk', 'important']

// ─────────────────────────────────────────────────────────────────────────────
// AudioKinematicEngine
// ─────────────────────────────────────────────────────────────────────────────

export class AudioKinematicEngine {

    /**
     * Binds audio segments with kinematic data based on temporal overlap.
     *
     * Algorithm:
     * 1. For each audio segment, find all kinematic snapshots that overlap in time
     * 2. Merge overlapping snapshots into a single kinematic context
     * 3. Extract semantic information from the text
     * 4. Compute quality score based on kinematic confidence + text clarity
     *
     * Complexity: O(A × K) where A = audio segments, K = kinematic snapshots
     */
    bind(
        audioSegments: AudioSegment[],
        kinematicSnapshots: KinematicSnapshot[],
        metadata: RecordingMetadata
    ): AudioKinematicBinding {
        const segments: AudioKinematicSegment[] = []

        for (let i = 0; i < audioSegments.length; i++) {
            const audio = audioSegments[i]

            // Find overlapping kinematic snapshots
            const overlapping = kinematicSnapshots.filter(k =>
                k.startTimeMs < audio.endTimeMs && k.endTimeMs > audio.startTimeMs
            )

            // Merge kinematic data
            const mergedKinematic = this.mergeKinematicSnapshots(overlapping, audio)

            // Extract semantic info
            const semantics = this.extractSemantics(audio.text)

            // Compute quality
            const quality = this.computeSegmentQuality(audio, mergedKinematic)

            segments.push({
                id: `ak_${i}_${Date.now()}`,
                orderIndex: i,
                audio,
                kinematic: mergedKinematic,
                semanticType: semantics.type,
                actionVerb: semantics.verb,
                targetObject: semantics.target,
                parameter: semantics.parameter,
                qualityScore: quality,
            })
        }

        return {
            id: `akb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            procedureName: '',
            specialistId: '',
            recordingStartMs: kinematicSnapshots[0]?.startTimeMs ?? 0,
            recordingEndMs: kinematicSnapshots[kinematicSnapshots.length - 1]?.endTimeMs ?? 0,
            totalDurationMs: (kinematicSnapshots[kinematicSnapshots.length - 1]?.endTimeMs ?? 0) -
                             (kinematicSnapshots[0]?.startTimeMs ?? 0),
            segments,
            rawAudioSegments: audioSegments,
            rawKinematicSnapshots: kinematicSnapshots,
            metadata,
        }
    }

    /**
     * Generates a DigitalProcedure-style step list from an AudioKinematicBinding.
     * Each segment becomes a ProcedureStep with reference kinematics.
     */
    generateProcedureSteps(binding: AudioKinematicBinding): GuidanceStep[] {
        const steps: GuidanceStep[] = []

        for (let i = 0; i < binding.segments.length; i++) {
            const seg = binding.segments[i]

            steps.push({
                stepNumber: i + 1,
                instruction: seg.audio.text,
                waitDurationMs: seg.audio.durationMs,
                validationLandmarks: FINGERTIP_INDICES,
                passThreshold: seg.semanticType === 'warning' ? 90 : 70,
                isCritical: seg.semanticType === 'warning' || seg.kinematic.isPrecisionPoint,
            })
        }

        return steps
    }

    /**
     * Generates audio guidance (text-to-speech) for a learner.
     * Returns an array of instructions with timing.
     */
    generateAudioGuidance(binding: AudioKinematicBinding): Array<{
        text: string
        playAtMs: number
        durationMs: number
    }> {
        const guidance: Array<{ text: string; playAtMs: number; durationMs: number }> = []
        let currentTimeMs = 0

        for (const seg of binding.segments) {
            // Add a brief pause before each instruction
            guidance.push({
                text: seg.audio.text,
                playAtMs: currentTimeMs,
                durationMs: seg.audio.durationMs,
            })

            currentTimeMs += seg.audio.durationMs + 300 // 300ms pause between instructions
        }

        return guidance
    }

    /**
     * Validates a learner's attempt against the binding.
     * Returns per-step scores and overall score.
     */
    validateLearnerAttempt(
        binding: AudioKinematicBinding,
        learnerKinematics: Landmark[][],
        learnerTimestamps: number[]
    ): {
        overallScore: number
        stepScores: Array<{
            stepIndex: number
            score: number
            passed: boolean
            feedback: string
        }>
    } {
        const stepScores: Array<{
            stepIndex: number
            score: number
            passed: boolean
            feedback: string
        }> = []

        let totalScore = 0

        for (let i = 0; i < binding.segments.length; i++) {
            const seg = binding.segments[i]

            // Find learner frames in this time window
            const startIdx = this.findFrameIndex(learnerTimestamps, seg.kinematic.startTimeMs)
            const endIdx = this.findFrameIndex(learnerTimestamps, seg.kinematic.endTimeMs)
            const learnerFrames = learnerKinematics.slice(startIdx, endIdx + 1)

            if (learnerFrames.length === 0) {
                stepScores.push({
                    stepIndex: i,
                    score: 0,
                    passed: false,
                    feedback: 'No movement detected in this step',
                })
                continue
            }

            // Compute similarity score
            const refFrames = seg.kinematic.frames
            const score = this.computeFrameSimilarity(refFrames, learnerFrames)
            const passed = score >= (seg.kinematic.isPrecisionPoint ? 85 : 70)

            let feedback = ''
            if (!passed) {
                feedback = this.generateFeedback(seg, score)
            }

            stepScores.push({ stepIndex: i, score, passed, feedback })
            totalScore += score
        }

        const overallScore = binding.segments.length > 0
            ? totalScore / binding.segments.length
            : 0

        return { overallScore, stepScores }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private mergeKinematicSnapshots(
        snapshots: KinematicSnapshot[],
        audio: AudioSegment
    ): KinematicSnapshot {
        if (snapshots.length === 0) {
            return {
                startTimeMs: audio.startTimeMs,
                endTimeMs: audio.endTimeMs,
                frames: [],
                meanVelocity: 0,
                isPrecisionPoint: false,
                meanConfidence: 0,
            }
        }

        const allFrames = snapshots.flatMap(s => s.frames)
        const meanVelocity = snapshots.reduce((sum, s) => sum + s.meanVelocity, 0) / snapshots.length
        const meanConfidence = snapshots.reduce((sum, s) => sum + s.meanConfidence, 0) / snapshots.length

        return {
            startTimeMs: Math.min(...snapshots.map(s => s.startTimeMs)),
            endTimeMs: Math.max(...snapshots.map(s => s.endTimeMs)),
            frames: allFrames,
            meanVelocity,
            isPrecisionPoint: meanVelocity < VELOCITY_PRECISION_THRESHOLD,
            meanConfidence,
        }
    }

    private extractSemantics(text: string): {
        type: AudioKinematicSegment['semanticType']
        verb: string
        target: string
        parameter: string
    } {
        const lower = text.toLowerCase()

        // Detect type
        const isWarning = WARNING_WORDS_PT.some(w => lower.includes(w)) ||
                          WARNING_WORDS_EN.some(w => lower.includes(w))

        // Extract verb
        const allVerbs = [...ACTION_VERBS_PT, ...ACTION_VERBS_EN]
        const verb = allVerbs.find(v => lower.includes(v)) || ''

        // Extract parameter (numbers + units)
        const paramMatch = text.match(/(\d+)\s*(graus|cm|mm|metros|vezes|segundos|minutes?|degrees?|times?)/i)
        const parameter = paramMatch ? paramMatch[0] : ''

        // Extract target (noun after verb)
        const words = lower.split(/\s+/)
        const verbIdx = words.findIndex(w => allVerbs.includes(w))
        const target = verbIdx >= 0 && verbIdx < words.length - 1
            ? words[verbIdx + 1]
            : ''

        return {
            type: isWarning ? 'warning' : verb ? 'action' : 'description',
            verb,
            target,
            parameter,
        }
    }

    private computeSegmentQuality(audio: AudioSegment, kinematic: KinematicSnapshot): number {
        const audioWeight = 0.4
        const kinematicWeight = 0.6

        const audioScore = audio.confidence * 100
        const kinematicScore = kinematic.meanConfidence * 100

        return Math.round(audioWeight * audioScore + kinematicWeight * kinematicScore)
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

    private computeFrameSimilarity(refFrames: Landmark[][], learnerFrames: Landmark[][]): number {
        if (refFrames.length === 0 || learnerFrames.length === 0) return 0

        // Use first reference frame and first learner frame for quick similarity
        const ref = refFrames[0]
        const learner = learnerFrames[0]

        if (ref.length !== learner.length) return 0

        let dotProduct = 0
        let refMag = 0
        let learnerMag = 0

        for (const idx of FINGERTIP_INDICES) {
            if (idx >= ref.length || idx >= learner.length) continue
            const r = ref[idx]
            const l = learner[idx]

            dotProduct += r.x * l.x + r.y * l.y + r.z * l.z
            refMag += r.x * r.x + r.y * r.y + r.z * r.z
            learnerMag += l.x * l.x + l.y * l.y + l.z * l.z
        }

        const magnitude = Math.sqrt(refMag) * Math.sqrt(learnerMag)
        if (magnitude <= 1e-10) return 0

        const cosSim = dotProduct / magnitude
        const d = (1 - cosSim) / 2
        const score = 100 / (1 + Math.exp(15 * (d - 0.15)))

        return Math.round(Math.max(0, Math.min(100, score)))
    }

    private generateFeedback(seg: AudioKinematicSegment, score: number): string {
        if (seg.semanticType === 'warning') {
            return `Atenção: ${seg.audio.text}. Precisão insuficiente (${Math.round(score)}%).`
        }
        if (seg.actionVerb) {
            return `Passo "${seg.actionVerb} ${seg.targetObject}": desvio detetado. Ajuste a posição.`
        }
        return `Desvio detetado no passo ${seg.orderIndex + 1}. Score: ${Math.round(score)}%.`
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const audioKinematicEngine = new AudioKinematicEngine()
