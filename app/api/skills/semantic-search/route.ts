import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured')
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/skills/semantic-search
//
// Authenticated semantic search.  Returns only skills the caller is allowed
// to see under the current RLS policies:
//
//   • is_public = true                          (visible to everyone)
//   • creator_id = auth.uid()                   (own private skills)
//   • company_id IN (caller's company_members)  (company skills)
//
// Security model:
//   The RPC `search_skills_semantic` is SECURITY INVOKER (PostgreSQL default
//   — no explicit SECURITY DEFINER clause in the migration).  When called via
//   the SSR client the function runs as the authenticated user, so RLS on
//   `skills` applies automatically.  Private skills from other tenants are
//   invisible without any application-level filtering needed.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const { query } = await request.json()

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // ── 1. Authenticate ──────────────────────────────────────────────────
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ── 2. Generate query embedding ──────────────────────────────────────
        const embeddingResponse = await getOpenAI().embeddings.create({
            model: 'text-embedding-ada-002',
            input: query,
        })
        const queryEmbedding = embeddingResponse.data[0].embedding

        // ── 3. Execute RPC via SSR client (RLS enforced) ─────────────────────
        // The SSR client carries the user's JWT.  search_skills_semantic is
        // SECURITY INVOKER, so the JOIN to `skills` obeys the caller's RLS:
        //   - "Public skills are viewable by anyone"   (is_public = true)
        //   - "Company skills visible to members"      (company_id check)
        //   - creator_id = auth.uid()                  (own skills)
        // Private skills belonging to other tenants are filtered out at the
        // database level before results ever reach this function.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: skills, error } = await (supabase as any).rpc(
            'search_skills_semantic',
            {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 10,
            }
        )

        if (error) {
            console.error('Semantic search error:', error)
            return NextResponse.json({ error: 'Search failed' }, { status: 500 })
        }

        return NextResponse.json({
            query,
            results: skills || [],
            count: (skills || []).length,
        })

    } catch (error) {
        console.error('Search API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/skills/semantic-search
//
// Index a skill by generating and storing its embedding.
// Called by skill-recorder.tsx after a successful save, and by the admin
// reindex job.
//
// Security model (three independent gates, all must pass):
//
//   Gate 1 — Authentication
//     Caller must hold a valid Supabase session.  Anonymous requests are
//     rejected with 401 before any database query is made.
//
//   Gate 2 — Ownership
//     Caller must be the skill creator (creator_id = auth.uid()).
//     Using the SSR client (RLS-enforced) means private skills from other
//     companies are invisible — no row is returned at all, giving a 403
//     without leaking whether the skill exists (oracle-safe).
//
//   Gate 3 — Company isolation
//     When a skill has a company_id set, the caller must belong to the same
//     company.  This prevents a malicious user from:
//       a) Being the technical creator_id but operating on behalf of a
//          different tenant after being removed from their company.
//       b) Exploiting any future creator_id re-assignment without matching
//          company membership.
//     The caller's company is resolved from company_members via the admin
//     client (intentional: company_members RLS requires an established
//     company context — same bootstrap pattern as tenant.ts).
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request: Request) {
    try {
        const { skillId, title, description, instructions } = await request.json()

        if (!skillId) {
            return NextResponse.json({ error: 'skillId is required' }, { status: 400 })
        }

        // ── Gate 1: Authentication ───────────────────────────────────────────
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ── Gate 2: Ownership via SSR client (RLS-enforced, oracle-safe) ─────
        // The SSR client carries the user's JWT.  If the skill is private and
        // owned by another tenant, RLS returns zero rows — the caller sees the
        // same 403 as "skill not found", preventing enumeration.
        const { data: skill, error: ownershipError } = await supabase
            .from('skills')
            .select('creator_id, company_id')
            .eq('id', skillId)
            .single() as {
                data: { creator_id: string | null; company_id: string | null } | null
                error: unknown
            }

        if (ownershipError || !skill) {
            return NextResponse.json(
                { error: 'Skill not found or access denied' },
                { status: 403 }
            )
        }

        if (skill.creator_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden: only the skill creator can index it' },
                { status: 403 }
            )
        }

        // ── Gate 3: Company isolation ────────────────────────────────────────
        // Only applies when the skill has a company_id (company-scoped skill).
        // Resolve the caller's current company from company_members using the
        // admin client — same pattern as lib/security/tenant.ts, intentional
        // RLS bypass for tenant bootstrap.
        if (skill.company_id) {
            const adminClient = await getAdminClient()
            const { data: membership } = await adminClient
                .from('company_members')
                .select('company_id')
                .eq('user_id', user.id)
                .single() as {
                    data: { company_id: string } | null
                    error: unknown
                }

            if (!membership || membership.company_id !== skill.company_id) {
                // Creator no longer belongs to the company that owns this skill.
                // This covers the "removed from company" attack vector.
                return NextResponse.json(
                    { error: 'Forbidden: your company does not own this skill' },
                    { status: 403 }
                )
            }
        }

        // ── Build content string ─────────────────────────────────────────────
        const content = `${title || ''} ${description || ''} ${instructions || ''}`.trim()

        if (!content) {
            return NextResponse.json({ error: 'No content to embed' }, { status: 400 })
        }

        // ── Generate embedding ───────────────────────────────────────────────
        const embeddingResponse = await getOpenAI().embeddings.create({
            model: 'text-embedding-ada-002',
            input: content,
        })
        const embedding = embeddingResponse.data[0].embedding

        // ── Upsert via admin client (all gates passed) ───────────────────────
        // Ownership and company membership verified above.  The admin client
        // guarantees the write succeeds regardless of skill_embeddings INSERT
        // policy changes in future migrations.
        const adminClient = await getAdminClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (adminClient as any)
            .from('skill_embeddings')
            .upsert(
                { skill_id: skillId, embedding, content },
                { onConflict: 'skill_id' }
            )

        if (upsertError) {
            console.error('Embedding upsert error:', upsertError)
            return NextResponse.json({ error: 'Failed to save embedding' }, { status: 500 })
        }

        return NextResponse.json({ success: true, skillId })

    } catch (error) {
        console.error('Embedding API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
