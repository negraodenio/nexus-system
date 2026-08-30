/**
 * P0-3 Critical Tests — StepEngine must NOT advance on failure.
 *
 * Verifies the fix: INCORRECT / completeStep(false) / maxAttempts can no longer
 * auto-advance to the next step or complete the skill. Only a sufficient alignment
 * score advances; only explicit Retry resumes; the skill completes only after every
 * step is approved.
 */

import { StepEngine } from '@/lib/core/step-engine'
import { RegistryStep } from '@/lib/core/okem-registry'

function makeStep(index: number): RegistryStep {
    return {
        index,
        name: `Step ${index + 1}`,
        description: 'Test step',
        referenceFrames: [],
        durationMs: 3000,
        isCritical: false,
        criticalLandmarks: [4, 8, 12, 16, 20],
        spatialVariance: 0,
        actionVerb: 'do',
        targetObject: 'thing',
        semanticType: 'action',
    }
}

function makeSteps(n: number): RegistryStep[] {
    return Array.from({ length: n }, (_, i) => makeStep(i))
}

describe('StepEngine P0-3 — no advance on failure', () => {
    let engine: StepEngine

    beforeEach(() => {
        engine = new StepEngine()
    })

    it('1. CORRECT alignment advances to the next step', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(2), 'test-skill')
        engine.start()
        const t = performance.now()
        for (let i = 0; i < 100; i++) engine.processAlignment(85, t + i * 33)
        expect(engine.getState()).toBe('STEP_COMPLETE')
        jest.advanceTimersByTime(1300) // STEP_COMPLETE -> NEXT_STEP
        jest.advanceTimersByTime(900) // NEXT_STEP -> STEP_ACTIVE
        expect(engine.getSession()!.currentStepIndex).toBe(1)
        expect(engine.getState()).toBe('STEP_ACTIVE')
        jest.useRealTimers()
    })

    it('2. INCORRECT does NOT advance to the next step', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(2), 'test-skill')
        engine.start()
        const t = performance.now()
        for (let i = 0; i < 200; i++) engine.processAlignment(20, t + i * 33)
        expect(engine.getState()).toBe('INCORRECT')
        expect(engine.getSession()!.currentStepIndex).toBe(0)
        expect(engine.getState()).not.toBe('NEXT_STEP')
        expect(engine.getState()).not.toBe('SKILL_COMPLETE')
        jest.useRealTimers()
    })

    it('3. INCORRECT stays on the same step (no progression)', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(3), 'test-skill')
        engine.start()
        const t = performance.now()
        for (let i = 0; i < 200; i++) engine.processAlignment(20, t + i * 33)
        expect(engine.getState()).toBe('INCORRECT')
        expect(engine.getSession()!.currentStepIndex).toBe(0)
        jest.useRealTimers()
    })

    it('4. Explicit Retry clears accumulated scores', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(1), 'test-skill')
        engine.start()
        const t = performance.now()
        for (let i = 0; i < 200; i++) engine.processAlignment(20, t + i * 33)
        expect(engine.getState()).toBe('INCORRECT')
        expect(engine.getStepInfo().currentAlignment).toBe(20)
        engine.retry()
        expect(engine.getStepInfo().currentAlignment).toBe(0)
        jest.useRealTimers()
    })

    it('5. Explicit Retry increments the attempt count', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(1), 'test-skill')
        engine.start()
        const t = performance.now()
        for (let i = 0; i < 200; i++) engine.processAlignment(20, t + i * 33)
        expect(engine.getState()).toBe('INCORRECT')
        const before = engine.getStepInfo().attempts
        engine.retry()
        expect(engine.getStepInfo().attempts).toBe(before + 1)
        jest.useRealTimers()
    })

    it('6. Retry returns to the same step', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(2), 'test-skill')
        engine.start()
        const t = performance.now()
        for (let i = 0; i < 200; i++) engine.processAlignment(20, t + i * 33)
        expect(engine.getState()).toBe('INCORRECT')
        const idx = engine.getSession()!.currentStepIndex
        engine.retry()
        jest.advanceTimersByTime(600)
        expect(engine.getSession()!.currentStepIndex).toBe(idx)
        jest.useRealTimers()
    })

    it('7. maxAttempts reached does NOT auto-advance', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(1), 'test-skill')
        engine.start()

        const reachIncorrect = () => {
            const t = performance.now()
            for (let i = 0; i < 250; i++) engine.processAlignment(20, t + i * 33)
        }

        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)

        // attempt count now equals maxAttempts (5) -> processing low scores must NOT advance
        const t = performance.now()
        for (let i = 0; i < 60; i++) engine.processAlignment(20, t + i * 33)
        expect(engine.getState()).toBe('INCORRECT')
        expect(engine.getSession()!.currentStepIndex).toBe(0)
        expect(engine.getState()).not.toBe('NEXT_STEP')
        expect(engine.getState()).not.toBe('SKILL_COMPLETE')
        jest.useRealTimers()
    })

    it('8. Repeated failure cannot complete the skill', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(1), 'test-skill')
        engine.start()

        const reachIncorrect = () => {
            const t = performance.now()
            for (let i = 0; i < 250; i++) engine.processAlignment(20, t + i * 33)
        }

        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        reachIncorrect()
        engine.retry(); jest.advanceTimersByTime(600)
        const t = performance.now()
        for (let i = 0; i < 60; i++) engine.processAlignment(20, t + i * 33)

        expect(engine.getState()).toBe('INCORRECT')
        expect(engine.getSession()!.completionStatus).toBe('in_progress')
        expect(engine.getSession()!.completedAt).toBeNull()
        jest.useRealTimers()
    })

    it('9. Only a sufficient score can complete the step', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(1), 'test-skill')
        engine.start()

        // Insufficient score never completes
        const t1 = performance.now()
        for (let i = 0; i < 200; i++) engine.processAlignment(20, t1 + i * 33)
        expect(engine.getState()).toBe('INCORRECT')

        // Sufficient score completes
        engine.retry(); jest.advanceTimersByTime(600)
        const t2 = performance.now()
        for (let i = 0; i < 100; i++) engine.processAlignment(85, t2 + i * 33)
        expect(engine.getState()).toBe('STEP_COMPLETE')
        jest.useRealTimers()
    })

    it('10. Skill completes only after ALL steps are approved', () => {
        jest.useFakeTimers()
        engine.init(makeSteps(3), 'test-skill')
        engine.start()

        const completeCurrent = () => {
            const t = performance.now()
            for (let i = 0; i < 100; i++) engine.processAlignment(85, t + i * 33)
            jest.advanceTimersByTime(1300)
            jest.advanceTimersByTime(900)
        }

        completeCurrent()
        expect(engine.getSession()!.currentStepIndex).toBe(1)
        completeCurrent()
        expect(engine.getSession()!.currentStepIndex).toBe(2)
        completeCurrent()

        expect(engine.getState()).toBe('SKILL_COMPLETE')
        expect(engine.getSession()!.completionStatus).toBe('completed')
        jest.useRealTimers()
    })
})
