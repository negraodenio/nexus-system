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
import { okemRegistry } from '@/lib/core/okem-registry'
import { okemStore } from '@/lib/core/okem-store'

// R2: Resolve an OKEM with Supabase as source of truth.
// The in-memory registry is an optional cache only; cold starts reload from Supabase.
async function resolveOKEM(okemId: string) {
    const cached = okemRegistry.getOKEM(okemId)
    if (cached) return cached

    const durable = await okemStore.retrieveForRegistry(okemId)
    if (durable) okemRegistry.storeRegistryOKEM(durable)
    return durable
}

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
        const okem = await resolveOKEM(okemId)
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
