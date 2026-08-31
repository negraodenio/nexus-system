/**
 * @fileoverview /api/learn and /api/guidance — DB-first retrieval tests
 *
 * Verifies that the routes use Supabase as the durable source of truth
 * and fall back to the in-memory registry only as a cache.
 */

import { POST } from '@/app/api/learn/route'
import { GET } from '@/app/api/guidance/route'

jest.mock('@/lib/core/okem-registry', () => ({
    okemRegistry: {
        getOKEM: jest.fn(),
        storeRegistryOKEM: jest.fn(),
    },
}))
jest.mock('@/lib/core/okem-store', () => ({
    okemStore: {
        retrieveForRegistry: jest.fn(),
    },
}))
jest.mock('@/lib/core/audio-kinematic', () => ({
    audioKinematicEngine: {
        validateLearnerAttempt: jest.fn().mockReturnValue({
            overallScore: 85,
            stepScores: [
                { stepIndex: 0, score: 90, passed: true, feedback: 'Good', instruction: 'Do it' },
                { stepIndex: 1, score: 80, passed: true, feedback: 'Ok', instruction: 'Check it' },
            ],
        }),
    },
}))

import { okemRegistry } from '@/lib/core/okem-registry'
import { okemStore } from '@/lib/core/okem-store'


const mockGetOKEM = okemRegistry.getOKEM as jest.MockedFunction<typeof okemRegistry.getOKEM>
const mockStoreRegistryOKEM = okemRegistry.storeRegistryOKEM as jest.MockedFunction<typeof okemRegistry.storeRegistryOKEM>
const mockRetrieveForRegistry = okemStore.retrieveForRegistry as jest.MockedFunction<typeof okemStore.retrieveForRegistry>

function learnRequest(okemId: string) {
    return new Request('http://localhost/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            okemId,
            kinematicFrames: Array.from({ length: 5 }, () => Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }))),
            timestamps: Array.from({ length: 5 }, (_, i) => i * 33),
            currentStepIndex: 0,
        }),
    })
}

function guidanceRequest(okemId: string) {
    return new Request(`http://localhost/api/guidance?okemId=${okemId}&step=0`)
}

describe('/api/learn — DB-first retrieval', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('loads from Supabase when the registry misses (cold start)', async () => {
        const okem = {
            id: 'okem-learn-1', procedureName: 'Learn OKEM', specialistId: 'u1', skillId: 'sk-1',
            totalDurationMs: 3000, stepCount: 1, confidence: 0.9, warnings: [],
            steps: [{ index: 0, name: 'S1', description: 'Desc', referenceFrames: [], durationMs: 3000, isCritical: false, criticalLandmarks: [], spatialVariance: 0, actionVerb: 'do', targetObject: 'thing', semanticType: 'action' }],
            guidance: [{ stepNumber: 1, instruction: 'Do it', waitDurationMs: 5000, passThreshold: 70, isCritical: false }],
            createdAt: Date.now(),
        }
        mockGetOKEM.mockReturnValue(undefined)
        mockRetrieveForRegistry.mockResolvedValue(okem)

        const res = await POST(learnRequest('okem-learn-1'))
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.success).toBe(true)
        expect(json.overallScore).toBe(85)
        expect(mockRetrieveForRegistry).toHaveBeenCalledWith('okem-learn-1')
        expect(mockStoreRegistryOKEM).toHaveBeenCalledWith(okem)
    })

    it('uses the registry cache when it is warm', async () => {
        const okem = {
            id: 'okem-learn-2', procedureName: 'Warm OKEM', specialistId: 'u1', skillId: 'sk-1',
            totalDurationMs: 3000, stepCount: 1, confidence: 0.9, warnings: [],
            steps: [{ index: 0, name: 'S1', description: 'Desc', referenceFrames: [], durationMs: 3000, isCritical: false, criticalLandmarks: [], spatialVariance: 0, actionVerb: 'do', targetObject: 'thing', semanticType: 'action' }],
            guidance: [{ stepNumber: 1, instruction: 'Do it', waitDurationMs: 5000, passThreshold: 70, isCritical: false }],
            createdAt: Date.now(),
        }
        mockGetOKEM.mockReturnValue(okem)

        const res = await POST(learnRequest('okem-learn-2'))

        expect(res.status).toBe(200)
        expect(mockRetrieveForRegistry).not.toHaveBeenCalled()
        expect(mockStoreRegistryOKEM).not.toHaveBeenCalled()
    })

    it('returns 404 when the OKEM is not found anywhere', async () => {
        mockGetOKEM.mockReturnValue(undefined)
        mockRetrieveForRegistry.mockResolvedValue(null)

        const res = await POST(learnRequest('okem-missing'))
        const json = await res.json()

        expect(res.status).toBe(404)
        expect(json.error).toBe('OKEM not found. Please record a procedure first.')
    })
})

describe('/api/guidance — DB-first retrieval', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('loads from Supabase when the registry misses (cold start)', async () => {
        const okem = {
            id: 'okem-guid-1', procedureName: 'Guid OKEM', specialistId: 'u1', skillId: 'sk-1',
            totalDurationMs: 3000, stepCount: 1, confidence: 0.9, warnings: [],
            steps: [],
            guidance: [{ stepNumber: 1, instruction: 'Do it', waitDurationMs: 5000, passThreshold: 70, isCritical: false }],
            createdAt: Date.now(),
        }
        mockGetOKEM.mockReturnValue(undefined)
        mockRetrieveForRegistry.mockResolvedValue(okem)

        const res = await GET(guidanceRequest('okem-guid-1'))
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.success).toBe(true)
        expect(json.currentStep.stepNumber).toBe(1)
        expect(mockRetrieveForRegistry).toHaveBeenCalledWith('okem-guid-1')
        expect(mockStoreRegistryOKEM).toHaveBeenCalledWith(okem)
    })

    it('returns 404 when the OKEM is not found anywhere', async () => {
        mockGetOKEM.mockReturnValue(undefined)
        mockRetrieveForRegistry.mockResolvedValue(null)

        const res = await GET(guidanceRequest('okem-missing'))
        const json = await res.json()

        expect(res.status).toBe(404)
        expect(json.error).toBe('OKEM not found. Please record a procedure first.')
    })
})
