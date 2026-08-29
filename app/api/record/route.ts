/**
 * @fileoverview POST /api/record
 * @description Records a specialist narrating while performing a procedure.
 *              Receives:
 *              - Audio transcription (from Whisper or browser Speech API)
 *              - Kinematic frames (from MediaPipe hand tracking)
 *              - Timestamps
 *
 *              Returns:
 *              - Auto-generated OKEM
 *              - Procedure ID
 *              - Confidence score
 */

import { NextResponse } from 'next/server'
import { autoOKEMGenerator, OKEMGenerationInput } from '@/lib/core/okem-generator'
import { Landmark } from '@/lib/kinetic-engine'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RecordRequest {
    /** Procedure name (e.g., "Troca de lâmpada do carro") */
    procedureName: string
    /** Specialist/parent ID */
    specialistId: string
    /** Language spoken (default: 'pt') */
    language?: string
    /** Audio transcription segments */
    audioSegments: Array<{
        text: string
        startTimeMs: number
        endTimeMs: number
        confidence?: number
    }>
    /** Kinematic frames (21 landmarks per frame) */
    kinematicFrames: Landmark[][]
    /** Timestamps for each frame in milliseconds */
    timestamps: number[]
    /** Audio energy levels per frame (0-1) */
    audioSamples?: number[]
    /** Recording metadata */
    metadata?: {
        device?: string
        resolution?: { width: number; height: number }
        fps?: number
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/record
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body: RecordRequest = await request.json()

        // ── Validation ─────────────────────────────────────────────────────
        if (!body.procedureName || typeof body.procedureName !== 'string') {
            return NextResponse.json(
                { error: 'procedureName is required' },
                { status: 400 }
            )
        }

        if (!body.specialistId || typeof body.specialistId !== 'string') {
            return NextResponse.json(
                { error: 'specialistId is required' },
                { status: 400 }
            )
        }

        if (!body.kinematicFrames || body.kinematicFrames.length < 10) {
            return NextResponse.json(
                { error: 'At least 10 kinematic frames required' },
                { status: 400 }
            )
        }

        if (!body.timestamps || body.timestamps.length !== body.kinematicFrames.length) {
            return NextResponse.json(
                { error: 'timestamps length must match kinematicFrames length' },
                { status: 400 }
            )
        }

        // ── Prepare audio segments ─────────────────────────────────────────
        const audioSegments = body.audioSegments.map(seg => ({
            id: `audio_${seg.startTimeMs}`,
            text: seg.text,
            startTimeMs: seg.startTimeMs,
            endTimeMs: seg.endTimeMs,
            durationMs: seg.endTimeMs - seg.startTimeMs,
            confidence: seg.confidence ?? 0.9,
            language: body.language ?? 'pt',
        }))

        // ── Prepare audio samples (energy levels) ──────────────────────────
        // If not provided, create synthetic ones based on text segments
        const audioSamples = body.audioSamples ?? generateSyntheticEnergy(
            audioSegments,
            body.timestamps.length
        )

        // ── Generate OKEM ──────────────────────────────────────────────────
        const input: OKEMGenerationInput = {
            procedureName: body.procedureName,
            specialistId: body.specialistId,
            audioSamples,
            textSegments: audioSegments,
            kinematicFrames: body.kinematicFrames,
            timestamps: body.timestamps,
            metadata: {
                device: body.metadata?.device ?? 'Unknown',
                resolution: body.metadata?.resolution ?? { width: 1920, height: 1080 },
                fps: body.metadata?.fps ?? 30,
                language: body.language ?? 'pt',
            },
        }

        const okem = autoOKEMGenerator.generate(input)

        // ── Generate procedure steps ───────────────────────────────────────
        const guidance = autoOKEMGenerator.generateGuidance(okem)

        // ── Response ───────────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            okem: {
                id: okem.id,
                procedureName: okem.procedureName,
                specialistId: okem.specialistId,
                stepCount: okem.stepCount,
                totalDurationMs: okem.totalDurationMs,
                confidence: okem.confidence,
                warnings: okem.warnings,
                steps: okem.steps.map(step => ({
                    index: step.index,
                    name: step.name,
                    description: step.description,
                    durationMs: step.durationMs,
                    isCritical: step.isCritical,
                    actionVerb: step.actionVerb,
                    targetObject: step.targetObject,
                    semanticType: step.semanticType,
                })),
            },
            guidance: guidance.map(g => ({
                stepNumber: g.stepNumber,
                instruction: g.instruction,
                waitDurationMs: g.waitDurationMs,
                passThreshold: g.passThreshold,
                isCritical: g.isCritical,
            })),
        })

    } catch (error) {
        console.error('Record error:', error)
        return NextResponse.json(
            { error: 'Failed to process recording' },
            { status: 500 }
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Generate synthetic audio energy from text segments
// ─────────────────────────────────────────────────────────────────────────────

function generateSyntheticEnergy(
    audioSegments: Array<{ startTimeMs: number; endTimeMs: number }>,
    frameCount: number
): number[] {
    const energy = Array(frameCount).fill(0.1) // Default: silence

    for (const seg of audioSegments) {
        const startFrame = Math.floor(seg.startTimeMs / 33)
        const endFrame = Math.floor(seg.endTimeMs / 33)

        for (let i = startFrame; i < endFrame && i < frameCount; i++) {
            energy[i] = 0.7 + Math.random() * 0.2 // Simulate speech energy
        }
    }

    return energy
}
