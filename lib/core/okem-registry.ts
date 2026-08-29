/**
 * @fileoverview Shared OKEM Registry
 * @description In-memory OKEM registry shared across API routes.
 *              Replaces the separate in-memory Maps in /api/learn and /api/guidance.
 *              This is the single source of truth for OKEM data in the server process.
 *
 * @version 1.0.0
 */

import { Landmark } from '../kinetic-engine'
import { AutoOKEM } from './okem-generator'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RegistryStep {
    index: number
    name: string
    description: string
    referenceFrames: Landmark[][]
    durationMs: number
    isCritical: boolean
    criticalLandmarks: number[]
    spatialVariance: number
    actionVerb: string
    targetObject: string
    semanticType: string
}

export interface RegistryGuidance {
    stepNumber: number
    instruction: string
    waitDurationMs: number
    passThreshold: number
    isCritical: boolean
}

export interface RegistryOKEM {
    id: string
    procedureName: string
    specialistId: string
    skillId?: string
    totalDurationMs: number
    stepCount: number
    confidence: number
    warnings: string[]
    steps: RegistryStep[]
    guidance: RegistryGuidance[]
    createdAt: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

class OKEMRegistry {
    private store = new Map<string, RegistryOKEM>()

    /**
     * Store an OKEM from AutoOKEM + guidance
     */
    storeOKEM(okem: AutoOKEM, guidance: RegistryGuidance[], skillId?: string): void {
        const steps: RegistryStep[] = okem.steps.map(s => ({
            index: s.index,
            name: s.name,
            description: s.description,
            referenceFrames: s.referenceFrames,
            durationMs: s.durationMs,
            isCritical: s.isCritical,
            criticalLandmarks: s.criticalLandmarks,
            spatialVariance: s.spatialVariance,
            actionVerb: s.actionVerb,
            targetObject: s.targetObject,
            semanticType: s.semanticType,
        }))

        this.store.set(okem.id, {
            id: okem.id,
            procedureName: okem.procedureName,
            specialistId: okem.specialistId,
            skillId,
            totalDurationMs: okem.totalDurationMs,
            stepCount: okem.stepCount,
            confidence: okem.confidence,
            warnings: okem.warnings,
            steps,
            guidance,
            createdAt: okem.createdAt,
        })
    }

    /**
     * Retrieve an OKEM by ID
     */
    getOKEM(id: string): RegistryOKEM | undefined {
        return this.store.get(id)
    }

    /**
     * Check if an OKEM exists
     */
    hasOKEM(id: string): boolean {
        return this.store.has(id)
    }

    /**
     * Retrieve an OKEM by skill ID
     */
    getOKEMBySkillId(skillId: string): RegistryOKEM | undefined {
        for (const okem of this.store.values()) {
            if (okem.skillId === skillId) return okem
        }
        return undefined
    }

    /**
     * Delete an OKEM
     */
    deleteOKEM(id: string): boolean {
        return this.store.delete(id)
    }

    /**
     * List all OKEMs
     */
    listOKEMs(): RegistryOKEM[] {
        return Array.from(this.store.values())
    }

    /**
     * Clear all OKEMs (for testing)
     */
    clear(): void {
        this.store.clear()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const okemRegistry = new OKEMRegistry()
