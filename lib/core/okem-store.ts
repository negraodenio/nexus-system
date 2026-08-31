/**
 * @fileoverview OKEM Persistence Layer (Supabase)
 * @description Stores and retrieves OKEMs from Supabase database.
 *              Replaces in-memory storage with persistent cloud storage.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

import { createClient } from '@/lib/supabase-server'
import { Landmark } from '@/lib/kinetic-engine'
import { AutoOKEM } from './okem-generator'
import { RegistryOKEM, RegistryStep, RegistryGuidance } from './okem-registry'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StoredOKEM {
    id: string
    procedure_name: string
    specialist_id: string
    skill_id: string | null
    niche_id: string | null
    language: string
    total_duration_ms: number
    step_count: number
    confidence: number
    warnings: string[]
    steps: SerializedStep[]
    guidance: SerializedGuidance[]
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface SerializedStep {
    index: number
    name: string
    description: string
    durationMs: number
    isCritical: boolean
    criticalLandmarks: number[]
    spatialVariance: number
    semanticType: string
    actionVerb: string
    targetObject: string
    referenceFramesJson: string // JSON stringified Landmark[][]
}

export interface SerializedGuidance {
    stepNumber: number
    instruction: string
    waitDurationMs: number
    passThreshold: number
    isCritical: boolean
}

export interface OKEMSearchResult {
    id: string
    procedure_name: string
    niche_id: string | null
    specialist_id: string
    step_count: number
    confidence: number
    language: string
    created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// OKEMStore Class
// ─────────────────────────────────────────────────────────────────────────────

export class OKEMStore {
    /**
     * Store an OKEM in Supabase
     *
     * @param okem      The generated OKEM
     * @param guidance  Per-step guidance
     * @param skillId   The Skill this OKEM belongs to (source of truth for skill linkage)
     * @param nicheId   Optional niche classification (NOT a Skill ID)
     * @param metadata  Arbitrary metadata (e.g. SpatialOKEM)
     */
    async store(
        okem: AutoOKEM,
        guidance: Array<{
            stepNumber: number
            instruction: string
            waitDurationMs: number
            passThreshold: number
            isCritical: boolean
        }>,
        skillId?: string,
        nicheId?: string,
        metadata: Record<string, unknown> = {}
    ): Promise<string> {
        const supabase: SupabaseClient = await createClient()

        const steps: SerializedStep[] = okem.steps.map(step => ({
            index: step.index,
            name: step.name,
            description: step.description,
            durationMs: step.durationMs,
            isCritical: step.isCritical,
            criticalLandmarks: step.criticalLandmarks,
            spatialVariance: step.spatialVariance,
            semanticType: step.semanticType,
            actionVerb: step.actionVerb,
            targetObject: step.targetObject,
            referenceFramesJson: JSON.stringify(step.referenceFrames),
        }))

        const { data, error } = await supabase
            .from('okems')
            .insert({
                id: okem.id,
                procedure_name: okem.procedureName,
                specialist_id: okem.specialistId,
                skill_id: skillId ?? null,
                niche_id: nicheId ?? null,
                language: 'pt',
                total_duration_ms: okem.totalDurationMs,
                step_count: okem.stepCount,
                confidence: okem.confidence,
                warnings: okem.warnings,
                steps,
                guidance,
                metadata,
            })
            .select('id')
            .single()

        if (error) {
            throw new Error(`Failed to store OKEM: ${error.message}`)
        }

        return data.id
    }

    /**
     * Retrieve an OKEM by ID
     */
    async retrieve(id: string): Promise<{
        okem: StoredOKEM
        guidance: SerializedGuidance[]
    } | null> {
        const supabase: SupabaseClient = await createClient()

        const { data, error } = await supabase
            .from('okems')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return null
        }

        return {
            okem: data as StoredOKEM,
            guidance: data.guidance as SerializedGuidance[],
        }
    }

    /**
     * Retrieve an OKEM by ID in the shape consumed by /api/learn and /api/guidance.
     * This is the durable (Supabase) retrieval path — the in-memory registry is only
     * an optimization layered on top of this. referenceFrames are deserialized here.
     */
    async retrieveForRegistry(id: string): Promise<RegistryOKEM | null> {
        const row = await this.retrieve(id)
        if (!row) return null

        const steps: RegistryStep[] = (row.okem.steps as SerializedStep[]).map(s => ({
            index: s.index,
            name: s.name,
            description: s.description,
            referenceFrames: JSON.parse(s.referenceFramesJson) as Landmark[][],
            durationMs: s.durationMs,
            isCritical: s.isCritical,
            criticalLandmarks: s.criticalLandmarks,
            spatialVariance: s.spatialVariance,
            actionVerb: s.actionVerb,
            targetObject: s.targetObject,
            semanticType: s.semanticType,
        }))

        const guidance: RegistryGuidance[] = (row.guidance as SerializedGuidance[]).map(g => ({
            stepNumber: g.stepNumber,
            instruction: g.instruction,
            waitDurationMs: g.waitDurationMs,
            passThreshold: g.passThreshold,
            isCritical: g.isCritical,
        }))

        return {
            id: row.okem.id,
            procedureName: row.okem.procedure_name,
            specialistId: row.okem.specialist_id,
            skillId: row.okem.skill_id ?? undefined,
            totalDurationMs: row.okem.total_duration_ms,
            stepCount: row.okem.step_count,
            confidence: row.okem.confidence,
            warnings: row.okem.warnings,
            steps,
            guidance,
            createdAt: new Date(row.okem.created_at).getTime(),
        }
    }

    /**
     * List OKEMs by specialist
     */
    async listBySpecialist(
        specialistId: string,
        limit = 20,
        offset = 0
    ): Promise<OKEMSearchResult[]> {
        const supabase: SupabaseClient = await createClient()

        const { data, error } = await supabase
            .from('okems')
            .select('id, procedure_name, niche_id, specialist_id, step_count, confidence, language, created_at')
            .eq('specialist_id', specialistId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            throw new Error(`Failed to list OKEMs: ${error.message}`)
        }

        return (data ?? []) as OKEMSearchResult[]
    }

    /**
     * List OKEMs by niche
     */
    async listByNiche(
        nicheId: string,
        limit = 20,
        offset = 0
    ): Promise<OKEMSearchResult[]> {
        const supabase: SupabaseClient = await createClient()

        const { data, error } = await supabase
            .from('okems')
            .select('id, procedure_name, niche_id, specialist_id, step_count, confidence, language, created_at')
            .eq('niche_id', nicheId)
            .order('confidence', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            throw new Error(`Failed to list OKEMs: ${error.message}`)
        }

        return (data ?? []) as OKEMSearchResult[]
    }

    /**
     * Search OKEMs by text
     */
    async search(
        query: string,
        limit = 20
    ): Promise<OKEMSearchResult[]> {
        const supabase: SupabaseClient = await createClient()

        const { data, error } = await supabase
            .from('okems')
            .select('id, procedure_name, niche_id, specialist_id, step_count, confidence, language, created_at')
            .ilike('procedure_name', `%${query}%`)
            .order('confidence', { ascending: false })
            .limit(limit)

        if (error) {
            throw new Error(`Failed to search OKEMs: ${error.message}`)
        }

        return (data ?? []) as OKEMSearchResult[]
    }

    /**
     * Delete an OKEM
     */
    async delete(id: string): Promise<void> {
        const supabase: SupabaseClient = await createClient()

        const { error } = await supabase
            .from('okems')
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(`Failed to delete OKEM: ${error.message}`)
        }
    }

    /**
     * Get OKEM statistics
     */
    async getStats(): Promise<{
        totalOKEMs: number
        totalSteps: number
        avgConfidence: number
        byNiche: Record<string, number>
    }> {
        const supabase: SupabaseClient = await createClient()

        const { data, error } = await supabase
            .from('okems')
            .select('id, niche_id, step_count, confidence')

        if (error) {
            throw new Error(`Failed to get stats: ${error.message}`)
        }

        const okems = data ?? []
        const totalOKEMs = okems.length
        const totalSteps = okems.reduce((sum: number, o: { step_count?: number }) => sum + (o.step_count ?? 0), 0)
        const avgConfidence = totalOKEMs > 0
            ? okems.reduce((sum: number, o: { confidence?: number }) => sum + (o.confidence ?? 0), 0) / totalOKEMs
            : 0

        const byNiche: Record<string, number> = {}
        for (const okem of okems) {
            const niche = (okem as { niche_id?: string }).niche_id ?? 'unknown'
            byNiche[niche] = (byNiche[niche] ?? 0) + 1
        }

        return { totalOKEMs, totalSteps, avgConfidence, byNiche }
    }

    /**
     * Convert StoredOKEM back to AutoOKEM format
     */
    toAutoOKEM(stored: StoredOKEM): AutoOKEM {
        const steps = (stored.steps as SerializedStep[]).map(step => ({
            index: step.index,
            name: step.name,
            description: step.description,
            referenceFrames: JSON.parse(step.referenceFramesJson) as Landmark[][],
            durationMs: step.durationMs,
            meanVelocity: 0,
            isCritical: step.isCritical,
            criticalLandmarks: step.criticalLandmarks,
            spatialVariance: step.spatialVariance,
            semanticType: step.semanticType as 'action' | 'warning' | 'description' | 'confirmation',
            actionVerb: step.actionVerb,
            targetObject: step.targetObject,
        }))

        return {
            id: stored.id,
            procedureName: stored.procedure_name,
            specialistId: stored.specialist_id,
            createdAt: new Date(stored.created_at).getTime(),
            totalDurationMs: stored.total_duration_ms,
            stepCount: stored.step_count,
            steps,
            globalEnvelope: {
                meanDurationMs: steps.length > 0
                    ? steps.reduce((sum, s) => sum + s.durationMs, 0) / steps.length
                    : 0,
                stdDevDurationMs: 0,
                meanVelocity: 0,
                stdDevVelocity: 0,
            },
            confidence: stored.confidence,
            warnings: stored.warnings,
            binding: {} as AutoOKEM['binding'], // Not stored
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const okemStore = new OKEMStore()
