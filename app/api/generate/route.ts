import { NextResponse } from 'next/server'
import { generateAnalogy, generateEmbedding, ModelId } from '@/lib/ai-client'
import { supabaseAdmin as adminClient } from '@/lib/supabase'

const supabaseAdmin = adminClient as any

export async function POST(req: Request) {
    try {
        const { concept, audience, model, image, systemPrompt, visualMode } = await req.json()

        if ((!concept && !image) || !audience) { // Allow image-only if concept is missing
            // return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            // Relaxed validation for image interactions
        }

        // ... exact cache check ...

        // 3. Generate new analogy
        const generated = await generateAnalogy({
            concept,
            audience,
            model: model as ModelId,
            image,
            systemPrompt, // Pass the custom prompt from Context
            preferredVisualType: visualMode // Force reality mode if requested
        })

        // 4. Save to database (Safely)
        try {
            // First ensure concept exists
            const normalizedName = concept.toLowerCase().trim()

            let conceptId: string

            const { data: existingConcept } = await supabaseAdmin
                .from('concepts')
                .select('id')
                .eq('normalized_name', normalizedName)
                .single()

            if (existingConcept) {
                conceptId = existingConcept.id
            } else {
                const { data: newConcept, error: createError } = await supabaseAdmin
                    .from('concepts')
                    .insert({
                        name: concept,
                        normalized_name: normalizedName,
                        category: 'general' // Default category
                    })
                    .select('id')
                    .single()

                if (createError) throw createError
                conceptId = newConcept.id
            }

            // Generate embedding for the analogy (optional, for future RAG)
            const embedding = await generateEmbedding(generated.analogy)

            // Store analogy
            await supabaseAdmin.from('analogies').insert({
                concept_id: conceptId,
                audience: audience,
                analogy_text: generated.analogy,
                core_ideas: generated.coreIdeas,
                limits: generated.limits || [],
                visual_type: generated.visual.type,
                visual_data: generated.visual, // Store the whole visual object or parts? Schema has visual_data JSONB.
                embedding: embedding,
                usage_count: 1
            })
        } catch (dbSaveError) {
            console.warn('Failed to save to database (non-fatal):', dbSaveError)
        }

        return NextResponse.json({
            source: 'generated',
            ...generated
        })

    } catch (error: any) {
        console.error('API Error:', error)
        const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error))
        return NextResponse.json({ error: `Debug: ${errorMessage}` }, { status: 500 })
    }
}
