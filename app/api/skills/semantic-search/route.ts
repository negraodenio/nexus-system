import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

// Lazy initialization to avoid build errors when API key is not set
const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured')
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function POST(request: Request) {
    try {
        const { query } = await request.json()

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // Security: Require authentication to prevent API abuse
        // For APEX Demo, we allow anonymous access to this specific read-only search capability
        // const supabase = await createClient()
        // const { data: { user } } = await supabase.auth.getUser()

        // if (!user) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // }

        // Generate embedding for the search query
        const embeddingResponse = await getOpenAI().embeddings.create({
            model: 'text-embedding-ada-002',
            input: query
        })

        const queryEmbedding = embeddingResponse.data[0].embedding

        // Search for similar skills using pgvector
        const { data: skills, error } = await (supabaseAdmin as any).rpc('search_skills_semantic', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 10
        })

        if (error) {
            console.error('Semantic search error:', error)
            return NextResponse.json({ error: 'Search failed' }, { status: 500 })
        }

        return NextResponse.json({
            query,
            results: skills || [],
            count: skills?.length || 0
        })

    } catch (error) {
        console.error('Search API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Endpoint to generate embeddings for a skill
export async function PUT(request: Request) {
    try {
        const { skillId, title, description, instructions } = await request.json()

        if (!skillId) {
            return NextResponse.json({ error: 'skillId is required' }, { status: 400 })
        }

        // Create text to embed - Now including instructions (POP/SOP content)
        const content = `${title || ''} ${description || ''} ${instructions || ''}`.trim()

        if (!content) {
            return NextResponse.json({ error: 'No content to embed' }, { status: 400 })
        }

        // Generate embedding
        const embeddingResponse = await getOpenAI().embeddings.create({
            model: 'text-embedding-ada-002',
            input: content
        })

        const embedding = embeddingResponse.data[0].embedding

        // Upsert embedding
        const { error } = await (supabaseAdmin as any)
            .from('skill_embeddings')
            .upsert({
                skill_id: skillId,
                embedding: embedding,
                content: content
            }, {
                onConflict: 'skill_id'
            })

        if (error) {
            console.error('Embedding upsert error:', error)
            return NextResponse.json({ error: 'Failed to save embedding' }, { status: 500 })
        }

        return NextResponse.json({ success: true, skillId })

    } catch (error) {
        console.error('Embedding API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
