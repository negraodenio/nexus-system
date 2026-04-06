import { NextResponse } from 'next/server'
import { predictMotion } from '@/lib/ai-client'
import { supabaseAdmin as adminClient } from '@/lib/supabase'

const supabaseAdmin = adminClient as any

export async function POST(req: Request) {
    try {
        const { emgEmbedding, currentLandmarks, companyId } = await req.json()

        if (!emgEmbedding || !currentLandmarks) {
            return NextResponse.json({ error: 'Missing emgEmbedding or currentLandmarks' }, { status: 400 })
        }

        // =========================================================
        // STEP 1 — Retrieval (Neuromuscular RAG)
        // =========================================================
        let ragContext = "No similar patterns found in database."
        try {
            const { data: patterns, error } = await supabaseAdmin
                .rpc('match_emg_patterns', {
                    query_embedding: emgEmbedding,
                    p_company_id: companyId,
                    match_threshold: 0.75,
                    match_count: 3
                })

            if (!error && patterns && patterns.length > 0) {
                ragContext = patterns.map((p: any) => 
                    `Pattern: ${p.label}. Metadata: ${JSON.stringify(p.metadata)}`
                ).join('\n')
            }
        } catch (ragErr) {
            console.warn('Neuromuscular RAG match failed (non-fatal):', ragErr)
        }

        // =========================================================
        // STEP 2 — Prediction via MiniMax M2.7
        // =========================================================
        const prediction = await predictMotion(currentLandmarks, ragContext)

        if (!prediction) {
            throw new Error('Failed to generate motion prediction')
        }

        return NextResponse.json({
            source: 'neural-rag',
            ...prediction
        })

    } catch (error: any) {
        console.error('Prediction API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
