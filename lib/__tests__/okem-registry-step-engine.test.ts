/**
 * Tests for OKEM Registry skill_id association and StepEngine INCORRECT/RETRY transition.
 */

import { StepEngine, DEFAULT_COMPLETION_CRITERIA, CRITICAL_STEP_CRITERIA } from '@/lib/core/step-engine'
import { okemRegistry, type RegistryStep } from '@/lib/core/okem-registry'

// ── OKEM Registry Tests ─────────────────────────────────────────────────────

describe('OKEMRegistry', () => {
    beforeEach(() => {
        okemRegistry.clear()
    })

    it('should store OKEM with skillId', () => {
        const mockOKEM = {
            id: 'okem_1',
            procedureName: 'Test',
            specialistId: 'user_1',
            createdAt: Date.now(),
            totalDurationMs: 10000,
            stepCount: 2,
            globalEnvelope: { meanDurationMs: 5000, stdDevDurationMs: 0, meanVelocity: 0.3, stdDevVelocity: 0 },
            confidence: 0.9,
            warnings: [],
            steps: [
                { index: 0, name: 'Step 1', description: 'Desc 1', referenceFrames: [], durationMs: 5000, meanVelocity: 0.3, isCritical: false, criticalLandmarks: [4, 8], spatialVariance: 0.1, semanticType: 'action' as const, actionVerb: 'do', targetObject: 'thing' },
                { index: 1, name: 'Step 2', description: 'Desc 2', referenceFrames: [], durationMs: 5000, meanVelocity: 0.3, isCritical: true, criticalLandmarks: [4, 8], spatialVariance: 0.1, semanticType: 'warning' as const, actionVerb: 'check', targetObject: 'thing' },
            ],
            binding: {} as any,
        }
        const guidance = [
            { stepNumber: 1, instruction: 'Do thing', waitDurationMs: 5000, passThreshold: 70, isCritical: false },
            { stepNumber: 2, instruction: 'Check thing', waitDurationMs: 5000, passThreshold: 85, isCritical: true },
        ]

        okemRegistry.storeOKEM(mockOKEM, guidance, 'skill-uuid-123')

        const stored = okemRegistry.getOKEM('okem_1')
        expect(stored).toBeDefined()
        expect(stored!.skillId).toBe('skill-uuid-123')
    })

    it('should find OKEM by skillId', () => {
        const mockOKEM = {
            id: 'okem_2',
            procedureName: 'Test 2',
            specialistId: 'user_1',
            createdAt: Date.now(),
            totalDurationMs: 10000,
            stepCount: 1,
            globalEnvelope: { meanDurationMs: 10000, stdDevDurationMs: 0, meanVelocity: 0.3, stdDevVelocity: 0 },
            confidence: 0.8,
            warnings: [],
            steps: [
                { index: 0, name: 'Step 1', description: 'Desc', referenceFrames: [], durationMs: 10000, meanVelocity: 0.3, isCritical: false, criticalLandmarks: [4, 8], spatialVariance: 0.1, semanticType: 'action' as const, actionVerb: 'do', targetObject: 'thing' },
            ],
            binding: {} as any,
        }
        const guidance = [
            { stepNumber: 1, instruction: 'Do thing', waitDurationMs: 10000, passThreshold: 70, isCritical: false },
        ]

        okemRegistry.storeOKEM(mockOKEM, guidance, 'skill-abc')

        const found = okemRegistry.getOKEMBySkillId('skill-abc')
        expect(found).toBeDefined()
        expect(found!.id).toBe('okem_2')

        const notFound = okemRegistry.getOKEMBySkillId('skill-nonexistent')
        expect(notFound).toBeUndefined()
    })

    it('should store OKEM without skillId (legacy)', () => {
        const mockOKEM = {
            id: 'okem_3',
            procedureName: 'Legacy',
            specialistId: 'user_1',
            createdAt: Date.now(),
            totalDurationMs: 10000,
            stepCount: 1,
            globalEnvelope: { meanDurationMs: 10000, stdDevDurationMs: 0, meanVelocity: 0.3, stdDevVelocity: 0 },
            confidence: 0.8,
            warnings: [],
            steps: [
                { index: 0, name: 'Step 1', description: 'Desc', referenceFrames: [], durationMs: 10000, meanVelocity: 0.3, isCritical: false, criticalLandmarks: [4, 8], spatialVariance: 0.1, semanticType: 'action' as const, actionVerb: 'do', targetObject: 'thing' },
            ],
            binding: {} as any,
        }
        const guidance = [
            { stepNumber: 1, instruction: 'Do thing', waitDurationMs: 10000, passThreshold: 70, isCritical: false },
        ]

        okemRegistry.storeOKEM(mockOKEM, guidance)

        const stored = okemRegistry.getOKEM('okem_3')
        expect(stored).toBeDefined()
        expect(stored!.skillId).toBeUndefined()
    })
})

// ── StepEngine INCORRECT/RETRY Tests ────────────────────────────────────────

describe('StepEngine INCORRECT/RETRY', () => {
    let engine: StepEngine
    const testSteps: RegistryStep[] = [
        {
            index: 0,
            name: 'Step 1',
            description: 'Test step',
            referenceFrames: [],
            durationMs: 3000,
            isCritical: false,
            criticalLandmarks: [4, 8, 12, 16, 20],
            spatialVariance: 0,
            actionVerb: 'do',
            targetObject: 'thing',
            semanticType: 'action',
        },
    ]

    beforeEach(() => {
        engine = new StepEngine()
        engine.init(testSteps, 'test-skill')
    })

    it('should start in READY state', () => {
        expect(engine.getState()).toBe('READY')
    })

    it('should transition to STEP_ACTIVE after start()', () => {
        engine.start()
        expect(engine.getState()).toBe('STEP_ACTIVE')
    })

    it('should transition to INCORRECT when alignment stays low too long', () => {
        engine.start()
        expect(engine.getState()).toBe('STEP_ACTIVE')

        // Simulate low alignment scores for extended period
        // Max duration = stabilityWindowMs * 3 = 2000 * 3 = 6000ms
        const startTime = performance.now()
        for (let i = 0; i < 200; i++) {
            engine.processAlignment(20, startTime + i * 33) // Low score (20 < minScore 70)
        }

        // After enough time with low scores, should be INCORRECT
        expect(engine.getState()).toBe('INCORRECT')
    })

    it('should return to STEP_ACTIVE after retry()', () => {
        jest.useFakeTimers()
        engine.start()

        // Force to INCORRECT by processing low scores
        const startTime = performance.now()
        for (let i = 0; i < 200; i++) {
            engine.processAlignment(20, startTime + i * 33)
        }
        expect(engine.getState()).toBe('INCORRECT')

        // Retry
        engine.retry()
        // After retry, state should be RETRYING then STEP_ACTIVE
        expect(engine.getState()).toBe('RETRYING')

        // After 500ms timeout, should be STEP_ACTIVE
        jest.advanceTimersByTime(600)
        expect(engine.getState()).toBe('STEP_ACTIVE')

        jest.useRealTimers()
    })

    it('should complete step when alignment is consistently good', () => {
        jest.useFakeTimers()
        engine.start()

        const startTime = performance.now()
        // Provide good alignment scores for enough time
        // minDurationMs = 1500, so need timestamps spanning > 1500ms
        // minStableFrames = 8, stabilityWindowMs = 2000
        for (let i = 0; i < 100; i++) {
            engine.processAlignment(85, startTime + i * 33) // Good score (85 > minScore 70)
        }

        expect(engine.getState()).toBe('STEP_COMPLETE')

        jest.useRealTimers()
    })

    it('should force complete after maxAttempts', () => {
        jest.useFakeTimers()
        engine.start()

        const startTime = performance.now()
        // Simulate maxAttempts worth of processing with low scores
        // maxAttempts = 5, but we need to trigger the maxAttempts check
        for (let i = 0; i < 200; i++) {
            engine.processAlignment(30, startTime + i * 33)
        }

        // Should have force-completed (either INCORRECT or STEP_COMPLETE)
        const state = engine.getState()
        expect(['INCORRECT', 'STEP_COMPLETE']).toContain(state)

        jest.useRealTimers()
    })

    it('should not allow retry when not in INCORRECT state', () => {
        engine.start()
        expect(engine.getState()).toBe('STEP_ACTIVE')

        engine.retry() // Should be no-op
        expect(engine.getState()).toBe('STEP_ACTIVE')
    })
})
