/**
 * @fileoverview OKEM Store — cold-start retrieval + skill_id linkage tests
 *
 * Verifies the durable read path (okemStore.retrieveForRegistry) works
 * after a cold start / server restart, and that skill_id is surfaced
 * on the registry-shaped result used by /api/learn and /api/guidance.
 */

import { createClient } from '@/lib/supabase-server'
import { okemStore } from '@/lib/core/okem-store'
import type { AudioKinematicBinding } from '@/lib/core/audio-kinematic'

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function buildStoredRow(overrides: {
    id?: string
    skillId?: string | null
    referenceFramesJson?: string
    guidance?: { stepNumber: number; instruction: string; waitDurationMs: number; passThreshold: number; isCritical: boolean }[]
    steps?: { index: number; name: string; description: string; durationMs: number; isCritical: boolean; criticalLandmarks: number[]; spatialVariance: number; semanticType: string; actionVerb: string; targetObject: string; referenceFramesJson: string }[]
} = {}) {
    const step = overrides.steps?.[0] ?? {
        index: 0, name: 'Step 1', description: 'Desc',
        durationMs: 3000, isCritical: false,
        criticalLandmarks: [4, 8, 12, 16, 20],
        spatialVariance: 0, semanticType: 'action' as const,
        actionVerb: 'do', targetObject: 'thing',
        referenceFramesJson: '[ [[0,0,0],[1,1,1]] ]',
    }
    const guidance = overrides.guidance ?? [
        { stepNumber: 1, instruction: 'Do thing', waitDurationMs: 5000, passThreshold: 70, isCritical: false },
    ]
    return {
        id: overrides.id ?? 'okem-cold-1',
        procedure_name: 'Cold OKEM',
        specialist_id: 'specialist-1',
        skill_id: overrides.skillId ?? null,
        niche_id: null,
        language: 'pt',
        total_duration_ms: 3000,
        step_count: 1,
        confidence: 0.9,
        warnings: [],
        steps: [step],
        guidance,
        metadata: {},
        created_at: '2026-08-31T00:00:00Z',
        updated_at: '2026-08-31T00:00:00Z',
    }
}

function mockSupabaseRow(row: Record<string, unknown> | null) {
    const singleFn = jest.fn().mockResolvedValue({
        data: row,
        error: row ? null : { message: 'no rows found' },
    })
    return {
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: singleFn,
        }),
    }
}

function mockStoreChain(): { insertFn: jest.Mock; singleFn: jest.Mock; client: unknown } {
    const singleFn = jest.fn().mockResolvedValue({ data: { id: 'okem-sk-1' }, error: null })
    const insertFn = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: singleFn }),
    })
    const client = {
        from: jest.fn().mockImplementation((table: string) => {
            if (table === 'okems') {
                return { insert: insertFn }
            }
            return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn() }
        }),
    }
    return { insertFn, singleFn, client }
}

describe('okemStore.retrieveForRegistry — cold-start / DB-first path', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('deserializes steps and guidance from Supabase row', async () => {
        const row = buildStoredRow()
        mockCreateClient.mockResolvedValue(mockSupabaseRow(row) as unknown as ReturnType<typeof createClient>)

        const result = await okemStore.retrieveForRegistry(row.id)

        expect(result).not.toBeNull()
        expect(result!.id).toBe(row.id)
        expect(result!.steps).toHaveLength(1)
        expect(result!.steps[0].referenceFrames).toEqual([[[0, 0, 0], [1, 1, 1]]])
        expect(result!.guidance).toHaveLength(1)
        expect(result!.guidance[0].stepNumber).toBe(1)
    })

    it('returns null when the row does not exist', async () => {
        mockCreateClient.mockResolvedValue(mockSupabaseRow(null) as unknown as ReturnType<typeof createClient>)

        const result = await okemStore.retrieveForRegistry('missing-id')

        expect(result).toBeNull()
    })

    it('surfaces skillId on the registry-shaped result', async () => {
        const row = buildStoredRow({ skillId: 'skill-uuid-123' })
        mockCreateClient.mockResolvedValue(mockSupabaseRow(row) as unknown as ReturnType<typeof createClient>)

        const result = await okemStore.retrieveForRegistry(row.id)

        expect(result).not.toBeNull()
        expect(result!.skillId).toBe('skill-uuid-123')
    })

    it('returns skillId undefined when the OKEM has no linked skill', async () => {
        const row = buildStoredRow({ skillId: null })
        mockCreateClient.mockResolvedValue(mockSupabaseRow(row) as unknown as ReturnType<typeof createClient>)

        const result = await okemStore.retrieveForRegistry(row.id)

        expect(result).not.toBeNull()
        expect(result!.skillId).toBeUndefined()
    })

    it('returns a fresh object on every call (no stale shared cache)', async () => {
        const row = buildStoredRow()
        mockCreateClient.mockResolvedValue(mockSupabaseRow(row) as unknown as ReturnType<typeof createClient>)

        const a = await okemStore.retrieveForRegistry(row.id)
        const b = await okemStore.retrieveForRegistry(row.id)

        expect(a).not.toBe(b)
        expect(a!.steps).not.toBe(b!.steps)
    })
})

describe('okemStore.store — skill_id linkage write', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('writes skill_id from the store() parameter into Supabase', async () => {
        const { insertFn, client } = mockStoreChain()
        mockCreateClient.mockResolvedValue(client as unknown as ReturnType<typeof createClient>)

        await okemStore.store(
            { id: 'okem-sk-1', procedureName: 'X', specialistId: 'u1', createdAt: Date.now(), steps: [], warnings: [], confidence: 0.9, totalDurationMs: 1000, stepCount: 1, globalEnvelope: { meanDurationMs: 0, stdDevDurationMs: 0, meanVelocity: 0, stdDevVelocity: 0 }, binding: {} as unknown as AudioKinematicBinding },
            [{ stepNumber: 1, instruction: 'Do it', waitDurationMs: 1000, passThreshold: 70, isCritical: false }],
            'skill-uuid-123',
            'niche-uuid-999'
        )

        const callArg = insertFn.mock.calls[0][0]
        expect(callArg.skill_id).toBe('skill-uuid-123')
        expect(callArg.niche_id).toBe('niche-uuid-999')
    })

    it('writes skill_id as null when no skillId is provided', async () => {
        const { insertFn, client } = mockStoreChain()
        mockCreateClient.mockResolvedValue(client as unknown as ReturnType<typeof createClient>)

        await okemStore.store(
            { id: 'okem-sk-2', procedureName: 'Y', specialistId: 'u1', createdAt: Date.now(), steps: [], warnings: [], confidence: 0.9, totalDurationMs: 1000, stepCount: 1, globalEnvelope: { meanDurationMs: 0, stdDevDurationMs: 0, meanVelocity: 0, stdDevVelocity: 0 }, binding: {} as unknown as AudioKinematicBinding },
            [{ stepNumber: 1, instruction: 'Do it', waitDurationMs: 1000, passThreshold: 70, isCritical: false }],
        )

        const callArg = insertFn.mock.calls[0][0]
        expect(callArg.skill_id).toBeNull()
    })
})
