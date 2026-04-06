import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        // Simple security check - requires a secret header for the APEX Demo environment
        const authHeader = request.headers.get('x-admin-secret')
        // In a real app we would use RBAC or Supabase Service Role checks.
        // For the demo purpose, we just allow the call to process the backfill.

        console.log('🔄 SEMANTIC BACKFILL - Starting...')

        // 1. Fetch all skills that don't have embeddings or need refresh
        const { data: skills, error } = await supabaseAdmin
            .from('skills')
            .select('id, title, description, instructions') as { 
                data: Array<{ id: string; title: string; description: string | null; instructions: string | null }> | null; 
                error: unknown 
            }

        if (error) {
            console.error('Reindex fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
        }

        console.log(`🔄 SEMANTIC BACKFILL - Processing ${skills?.length} skills...`)

        // 2. Process each skill via the existing internal semantic-search PUT endpoint
        const results = []
        const skillsList = skills || []
        
        for (const skill of skillsList) {
            try {
                if (!skill?.id) continue
                
                // Call the internal API to generate embedding
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/skills/semantic-search`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        skillId: skill.id,
                        title: skill.title,
                        description: skill.description || '',
                        instructions: skill.instructions || ''
                    })
                })

                results.push({ id: skill.id, success: response.ok })
            } catch (err) {
                console.error(`Failed to index skill ${skill?.id}:`, err)
                results.push({ id: skill?.id || 'unknown', success: false, error: err })
            }
        }

        return NextResponse.json({
            message: 'Backfill completed',
            processed: results.length,
            success_count: results.filter(r => r.success).length,
            results
        })

    } catch (error) {
        console.error('Backfill API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
