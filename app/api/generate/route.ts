import { withSecurity } from '@/lib/security'
import { generateAnalogy, generateEmbedding, ModelId } from '@/lib/ai-client'
import { getAdminClient } from '@/lib/supabase/server'

// Similarity threshold for RAG match (0-1). 0.82 = "very similar concept"
const RAG_THRESHOLD = 0.82

export const POST = withSecurity(async ({ ctx, body }) => {
    const { concept, audience, model, image, systemPrompt, visualMode } = body

    if (!audience) {
        throw new Error('Missing audience')
    }

    // =========================================================
    // STEP 1 — Exact cache match
    // =========================================================
    if (concept && !image && typeof concept === 'string') {
        try {
            const supabaseAdmin = await getAdminClient()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const db = supabaseAdmin as any
            const { data: exactMatch } = await db
                .rpc('get_exact_analogy', {
                    p_concept_name: concept.toLowerCase().trim(),
                    p_audience: audience
                })

            if (exactMatch && exactMatch.length > 0) {
                const hit = exactMatch[0]
                // Increment usage counter (fire-and-forget)
                db
                    .from('analogies')
                    .update({ usage_count: (hit.usage_count || 0) + 1 })
                    .eq('id', hit.id)
                    .then(() => {})

                return {
                    source: 'exact',
                    analogy: hit.analogy_text,
                    coreIdeas: hit.core_ideas || [],
                    limits: hit.limits || [],
                    visual: hit.visual_data,
                }
            }
        } catch (exactErr) {
            console.warn('Exact match lookup failed (non-fatal):', exactErr)
        }
    }

    // =========================================================
    // STEP 2 — Vector similarity match (RAG)
    // =========================================================
    if (concept && !image && typeof concept === 'string') {
        try {
            const queryEmbedding = await generateEmbedding(concept)

            if (queryEmbedding) {
                const supabaseAdmin = await getAdminClient()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const db = supabaseAdmin as any
                const { data: similarMatches } = await db
                    .rpc('match_analogies', {
                        query_embedding: queryEmbedding,
                        target_audience: audience,
                        match_threshold: RAG_THRESHOLD,
                        match_count: 1
                    })

                if (similarMatches && similarMatches.length > 0) {
                    const match = similarMatches[0]

                    return {
                        source: 'rag',
                        analogy: match.analogy_text,
                        coreIdeas: [],
                        limits: [],
                        visual: match.visual_data,
                        ragSimilarity: match.similarity,
                        ragConceptName: match.concept_name,
                    }
                }
            }
        } catch (ragErr) {
            console.warn('RAG match failed (non-fatal):', ragErr)
        }
    }

    // =========================================================
    // STEP 3 — Generate new analogy via OpenRouter
    // =========================================================
    const generated = await generateAnalogy({
concept: concept as string,
        audience: audience as string,
        model: (model || 'minimax-m2.7') as ModelId,
image: image as string | undefined,
        systemPrompt: systemPrompt as string | undefined,
        preferredVisualType: visualMode as string | undefined
    })

    // =========================================================
    // STEP 4 — Save to DB for future cache hits (non-fatal)
    // =========================================================
    if (concept && !image && typeof concept === 'string') {
        try {
            const normalizedName = concept.toLowerCase().trim()
            const supabaseAdmin = await getAdminClient()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const db = supabaseAdmin as any

            // Upsert concept
            const { data: conceptRow } = await db
                .from('concepts')
                .upsert(
                    { name: concept, normalized_name: normalizedName, category: 'general' },
                    { onConflict: 'normalized_name', ignoreDuplicates: false }
                )
                .select('id')
                .single()

            if (conceptRow?.id) {
                // Generate and save embedding asynchronously
                generateEmbedding(generated.analogy).then(async (embedding) => {
                    await db.from('analogies').insert({
                        concept_id: conceptRow.id,
audience: audience as string,
                        analogy_text: generated.analogy,
                        core_ideas: generated.coreIdeas || [],
                        limits: generated.limits || [],
                        visual_type: generated.visual?.type || 'mermaid',
                        visual_data: generated.visual || {},
                        embedding,
                        generated_by: model || 'minimax-m2.7',
                        usage_count: 1,
                    })
                }).catch(e => console.warn('Embedding save failed:', e))
            }
        } catch (dbErr) {
            console.warn('DB save failed (non-fatal):', dbErr)
        }
    }

    return {
        source: 'generated',
        ...generated
    }
})