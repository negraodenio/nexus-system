/**
 * @fileoverview POST /api/learn
 * @description Validates a learner's execution against a recorded OKEM.
 *              Receives:
 *              - OKEM ID (from /api/record)
 *              - Learner's kinematic frames
 *              - Timestamps
 *
 *              Returns:
 *              - Per-step scores
 *              - Overall score
 *              - Feedback for each step
 *              - Current step instruction (for audio playback)
 */

import { NextResponse } from 'next/server'
import { audioKinematicEngine } from '@/lib/core/audio-kinematic'
import { Landmark } from '@/lib/kinetic-engine'
import { okemRegistry } from '@/lib/core/okem-registry'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LearnRequest {
    /** OKEM ID from /api/record */
    okemId: string
    /** Learner's kinematic frames */
    kinematicFrames: Landmark[][]
    /** Timestamps for each frame in milliseconds */
    timestamps: number[]
    /** Current step index (optional, for incremental validation) */
    currentStepIndex?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learn
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body: LearnRequest = await request.json()

        // ── Validation ─────────────────────────────────────────────────────
        if (!body.okemId || typeof body.okemId !== 'string') {
            return NextResponse.json(
                { error: 'okemId is required' },
                { status: 400 }
            )
        }

        if (!body.kinematicFrames || body.kinematicFrames.length < 5) {
            return NextResponse.json(
                { error: 'At least 5 kinematic frames required' },
                { status: 400 }
            )
        }

        // ── Retrieve OKEM ──────────────────────────────────────────────────
        const okem = okemRegistry.getOKEM(body.okemId)
        if (!okem) {
            return NextResponse.json(
                { error: 'OKEM not found. Please record a procedure first.' },
                { status: 404 }
            )
        }

        // ── Build binding for validation ───────────────────────────────────
        const binding = {
            id: okem.id,
            procedureName: okem.procedureName,
            specialistId: '',
            recordingStartMs: 0,
            recordingEndMs: 0,
            totalDurationMs: 0,
            segments: okem.steps.map((step, i) => ({
                id: `seg_${i}`,
                orderIndex: i,
                audio: {
                    id: `audio_${i}`,
                    text: step.description,
                    startTimeMs: 0,
                    endTimeMs: step.durationMs,
                    durationMs: step.durationMs,
                    confidence: 0.9,
                    language: 'pt',
                },
                kinematic: {
                    startTimeMs: 0,
                    endTimeMs: step.durationMs,
                    frames: step.referenceFrames,
                    meanVelocity: 0.3,
                    isPrecisionPoint: step.isCritical,
                    meanConfidence: 0.9,
                },
                semanticType: step.isCritical ? 'warning' as const : 'action' as const,
                actionVerb: step.actionVerb,
                targetObject: step.targetObject,
                parameter: '',
                qualityScore: 85,
            })),
            rawAudioSegments: [],
            rawKinematicSnapshots: [],
            metadata: {
                device: 'Unknown',
                resolution: { width: 1920, height: 1080 },
                fps: 30,
                lightingQuality: 'moderate' as const,
                avgLandmarksDetected: 21,
                spokenLanguage: 'pt',
            },
        }

        // ── Validate learner's attempt ─────────────────────────────────────
        const result = audioKinematicEngine.validateLearnerAttempt(
            binding,
            body.kinematicFrames,
            body.timestamps
        )

        // ── Determine current step instruction ─────────────────────────────
        const currentStep = body.currentStepIndex !== undefined
            ? okem.guidance[body.currentStepIndex]
            : okem.guidance[0]

        // ── Response ───────────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            overallScore: result.overallScore,
            stepScores: result.stepScores.map((score, i) => ({
                stepIndex: score.stepIndex,
                score: score.score,
                passed: score.passed,
                feedback: score.feedback,
                instruction: okem.guidance[i]?.instruction ?? '',
            })),
            currentInstruction: currentStep?.instruction ?? '',
            nextStepAvailable: result.overallScore >= 70,
            totalSteps: okem.steps.length,
            passedSteps: result.stepScores.filter(s => s.passed).length,
        })

    } catch (error) {
        console.error('Learn error:', error)
        return NextResponse.json(
            { error: 'Failed to validate learning attempt' },
            { status: 500 }
        )
    }
}
