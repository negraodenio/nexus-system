/**
 * @fileoverview GET /api/guidance
 * @description Returns audio guidance instructions for a learner.
 *              Used by the learner's device to play step-by-step instructions.
 *
 *              Query params:
 *              - okemId: The OKEM ID from /api/record
 *              - step: Step index (optional, defaults to 0)
 */

import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// In-memory OKEM store (same as /api/learn)
// ─────────────────────────────────────────────────────────────────────────────

const okemStore = new Map<string, {
    id: string
    procedureName: string
    steps: Array<{
        index: number
        name: string
        description: string
        referenceFrames: unknown[][]
        durationMs: number
        isCritical: boolean
        actionVerb: string
        targetObject: string
    }>
    guidance: Array<{
        stepNumber: number
        instruction: string
        waitDurationMs: number
        passThreshold: number
        isCritical: boolean
    }>
}>()

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/guidance
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const okemId = searchParams.get('okemId')
        const stepParam = searchParams.get('step')

        // ── Validation ─────────────────────────────────────────────────────
        if (!okemId) {
            return NextResponse.json(
                { error: 'okemId query parameter is required' },
                { status: 400 }
            )
        }

        // ── Retrieve OKEM ──────────────────────────────────────────────────
        const okem = okemStore.get(okemId)
        if (!okem) {
            return NextResponse.json(
                { error: 'OKEM not found. Please record a procedure first.' },
                { status: 404 }
            )
        }

        // ── Get step guidance ──────────────────────────────────────────────
        const stepIndex = stepParam ? parseInt(stepParam, 10) : 0

        if (stepIndex < 0 || stepIndex >= okem.guidance.length) {
            return NextResponse.json(
                { error: `Step index must be between 0 and ${okem.guidance.length - 1}` },
                { status: 400 }
            )
        }

        const guidance = okem.guidance[stepIndex]

        // ── Response ───────────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            procedureName: okem.procedureName,
            currentStep: {
                stepNumber: guidance.stepNumber,
                instruction: guidance.instruction,
                waitDurationMs: guidance.waitDurationMs,
                passThreshold: guidance.passThreshold,
                isCritical: guidance.isCritical,
            },
            totalSteps: okem.guidance.length,
            hasNextStep: stepIndex < okem.guidance.length - 1,
            nextStepIndex: stepIndex + 1 < okem.guidance.length ? stepIndex + 1 : null,
        })

    } catch (error) {
        console.error('Guidance error:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve guidance' },
            { status: 500 }
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/guidance - Store OKEM (called after /api/record)
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (!body.okemId || !body.guidance) {
            return NextResponse.json(
                { error: 'okemId and guidance are required' },
                { status: 400 }
            )
        }

        // Store OKEM for later retrieval
        okemStore.set(body.okemId, {
            id: body.okemId,
            procedureName: body.procedureName ?? 'Unknown',
            steps: body.steps ?? [],
            guidance: body.guidance,
        })

        return NextResponse.json({
            success: true,
            message: 'OKEM guidance stored successfully',
        })

    } catch (error) {
        console.error('Store guidance error:', error)
        return NextResponse.json(
            { error: 'Failed to store guidance' },
            { status: 500 }
        )
    }
}
