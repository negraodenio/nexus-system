/**
 * @fileoverview Step Engine - Skill Execution State Machine
 * @description Manages step-by-step skill execution with state transitions,
 *              completion detection, and retry logic. Consumes OKEM steps
 *              and orchestrates the learning experience.
 *
 * @version 1.0.0
 */

import { Landmark } from '../kinetic-engine'
import { RegistryStep } from './okem-registry'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StepState =
    | 'IDLE'           // Not started
    | 'READY'          // Camera ready, waiting to start
    | 'STEP_ACTIVE'    // Current step is being executed
    | 'ANALYZING'      // Analyzing user execution
    | 'CORRECT'        // Step completed correctly
    | 'INCORRECT'      // Step failed
    | 'RETRYING'       // User is retrying the step
    | 'STEP_COMPLETE'  // Step verified, transitioning
    | 'NEXT_STEP'      // Loading next step
    | 'SKILL_COMPLETE' // All steps done

export interface StepResult {
    stepIndex: number
    score: number
    attempts: number
    completed: boolean
    durationMs: number
    averageAlignment: number
    confidence: number
}

export interface PracticeSession {
    sessionId: string
    skillId: string
    startedAt: number
    completedAt: number | null
    currentStepIndex: number
    state: StepState
    stepResults: StepResult[]
    overallScore: number
    completionStatus: 'in_progress' | 'completed' | 'abandoned'
}

export interface StepCompletionCriteria {
    /** Minimum alignment score to pass [0, 100] */
    minScore: number
    /** Minimum frames with score above threshold */
    minStableFrames: number
    /** Maximum attempts before forced progression */
    maxAttempts: number
    /** Minimum duration for a step (prevents instant completion) */
    minDurationMs: number
    /** Stability window: frames must be consistently good */
    stabilityWindowMs: number
}

export interface StepEngineCallbacks {
    onStateChange?: (state: StepState, stepIndex: number) => void
    onStepComplete?: (result: StepResult) => void
    onSkillComplete?: (session: PracticeSession) => void
    onFeedback?: (feedback: string, isPositive: boolean) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_COMPLETION_CRITERIA: StepCompletionCriteria = {
    minScore: 70,
    minStableFrames: 8,
    maxAttempts: 5,
    minDurationMs: 1500,
    stabilityWindowMs: 2000,
}

export const CRITICAL_STEP_CRITERIA: StepCompletionCriteria = {
    minScore: 85,
    minStableFrames: 12,
    maxAttempts: 3,
    minDurationMs: 2000,
    stabilityWindowMs: 2500,
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Engine
// ─────────────────────────────────────────────────────────────────────────────

export class StepEngine {
    private steps: RegistryStep[] = []
    private session: PracticeSession | null = null
    private state: StepState = 'IDLE'
    private currentStepIndex = 0

    // Tracking
    private frameScores: number[] = []
    private stepStartTime = 0
    private stepAttemptCount = 0
    private stepAlignments: number[] = []

    // Callbacks
    private callbacks: StepEngineCallbacks = {}

    // Criteria
    private criteria: StepCompletionCriteria = DEFAULT_COMPLETION_CRITERIA

    /**
     * Initialize the step engine with OKEM steps
     */
    init(steps: RegistryStep[], skillId: string, callbacks?: StepEngineCallbacks): void {
        this.steps = steps
        this.callbacks = callbacks ?? {}
        this.currentStepIndex = 0
        this.frameScores = []
        this.stepAlignments = []

        this.session = {
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            skillId,
            startedAt: Date.now(),
            completedAt: null,
            currentStepIndex: 0,
            state: 'READY',
            stepResults: [],
            overallScore: 0,
            completionStatus: 'in_progress',
        }

        this.transitionTo('READY')
    }

    /**
     * Start the first step
     */
    start(): void {
        if (this.state !== 'READY') return
        this.startStep(0)
    }

    /**
     * Process a new alignment score from the live tracking
     * Returns the current state after processing
     */
    processAlignment(alignmentScore: number, timestamp: number): StepState {
        if (this.state !== 'STEP_ACTIVE' && this.state !== 'RETRYING') {
            return this.state
        }

        // Record score
        this.frameScores.push(alignmentScore)
        this.stepAlignments.push(alignmentScore)

        // Check completion
        const criteria = this.getCurrentCriteria()
        const step = this.steps[this.currentStepIndex]
        const effectiveCriteria = step?.isCritical ? CRITICAL_STEP_CRITERIA : criteria

        // Must meet minimum duration
        const elapsed = timestamp - this.stepStartTime
        if (elapsed < effectiveCriteria.minDurationMs) {
            return this.state
        }

        // Check if enough stable frames
        const recentScores = this.frameScores.slice(-effectiveCriteria.stabilityWindowMs / 33) // ~30fps
        const stableFrames = recentScores.filter(s => s >= effectiveCriteria.minScore).length

        if (stableFrames >= effectiveCriteria.minStableFrames) {
            // Step completed!
            this.completeStep(true, alignmentScore)
            return this.state
        }

        // Check if too many attempts
        if (this.stepAttemptCount >= effectiveCriteria.maxAttempts) {
            // Force progression with current score
            this.completeStep(false, alignmentScore)
            return this.state
        }

        return this.state
    }

    /**
     * Get the current step for display
     */
    getCurrentStep(): RegistryStep | null {
        return this.steps[this.currentStepIndex] ?? null
    }

    /**
     * Get current state
     */
    getState(): StepState {
        return this.state
    }

    /**
     * Get current session
     */
    getSession(): PracticeSession | null {
        return this.session
    }

    /**
     * Get step progress info
     */
    getStepInfo(): {
        currentStep: number
        totalSteps: number
        stepName: string
        stepDescription: string
        isCritical: boolean
        attempts: number
        currentAlignment: number
    } {
        const step = this.steps[this.currentStepIndex]
        const lastAlignment = this.stepAlignments.length > 0
            ? this.stepAlignments[this.stepAlignments.length - 1]
            : 0

        return {
            currentStep: this.currentStepIndex + 1,
            totalSteps: this.steps.length,
            stepName: step?.name ?? '',
            stepDescription: step?.description ?? '',
            isCritical: step?.isCritical ?? false,
            attempts: this.stepAttemptCount,
            currentAlignment: Math.round(lastAlignment),
        }
    }

    /**
     * Request retry for current step
     */
    retry(): void {
        if (this.state !== 'INCORRECT') return
        this.stepAttemptCount++
        this.frameScores = []
        this.stepAlignments = []
        this.transitionTo('RETRYING')
        // Immediately go back to active
        setTimeout(() => {
            if (this.state === 'RETRYING') {
                this.transitionTo('STEP_ACTIVE')
            }
        }, 500)
    }

    /**
     * Skip current step (for testing/development)
     */
    skip(): void {
        this.completeStep(false, 0)
    }

    /**
     * Abandon the session
     */
    abandon(): PracticeSession | null {
        if (this.session) {
            this.session.completedAt = Date.now()
            this.session.completionStatus = 'abandoned'
            this.computeOverallScore()
        }
        const session = this.session
        this.transitionTo('IDLE')
        return session
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private methods
    // ─────────────────────────────────────────────────────────────────────────

    private startStep(index: number): void {
        if (index >= this.steps.length) {
            this.completeSkill()
            return
        }

        this.currentStepIndex = index
        this.stepStartTime = performance.now()
        this.stepAttemptCount = 1
        this.frameScores = []
        this.stepAlignments = []

        if (this.session) {
            this.session.currentStepIndex = index
        }

        this.transitionTo('STEP_ACTIVE')
    }

    private completeStep(passed: boolean, finalScore: number): void {
        const averageAlignment = this.stepAlignments.length > 0
            ? this.stepAlignments.reduce((a, b) => a + b, 0) / this.stepAlignments.length
            : 0

        const result: StepResult = {
            stepIndex: this.currentStepIndex,
            score: Math.round(averageAlignment),
            attempts: this.stepAttemptCount,
            completed: passed,
            durationMs: performance.now() - this.stepStartTime,
            averageAlignment: Math.round(averageAlignment),
            confidence: finalScore,
        }

        if (this.session) {
            this.session.stepResults.push(result)
        }

        this.callbacks.onStepComplete?.(result)
        this.transitionTo('STEP_COMPLETE')

        // Auto-advance after brief delay
        setTimeout(() => {
            if (this.state === 'STEP_COMPLETE') {
                const nextIndex = this.currentStepIndex + 1
                if (nextIndex >= this.steps.length) {
                    this.completeSkill()
                } else {
                    this.callbacks.onFeedback?.(
                        passed
                            ? `Step ${this.currentStepIndex + 1} complete!`
                            : `Step ${this.currentStepIndex + 1} complete. Let's continue.`,
                        true
                    )
                    this.transitionTo('NEXT_STEP')
                    setTimeout(() => {
                        if (this.state === 'NEXT_STEP') {
                            this.startStep(nextIndex)
                        }
                    }, 800)
                }
            }
        }, 1200)
    }

    private completeSkill(): void {
        this.computeOverallScore()
        if (this.session) {
            this.session.completedAt = Date.now()
            this.session.completionStatus = 'completed'
        }
        this.transitionTo('SKILL_COMPLETE')
        this.callbacks.onSkillComplete?.(this.session!)
    }

    private computeOverallScore(): void {
        if (!this.session || this.session.stepResults.length === 0) return
        const scores = this.session.stepResults.map(r => r.averageAlignment)
        this.session.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }

    private transitionTo(newState: StepState): void {
        const oldState = this.state
        this.state = newState
        if (oldState !== newState) {
            this.callbacks.onStateChange?.(newState, this.currentStepIndex)
        }
    }

    private getCurrentCriteria(): StepCompletionCriteria {
        return this.criteria
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const stepEngine = new StepEngine()
