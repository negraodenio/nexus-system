import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security/rate-limit'

// Limit: 3 full reindex runs per 10 minutes from any single source.
// A reindex triggers an OpenAI API call per skill — this cap prevents
// accidental or deliberate billing exhaustion.
const RATE_LIMIT_MAX        = 3
const RATE_LIMIT_WINDOW_MS  = 10 * 60 * 1000   // 10 minutes
const RATE_LIMIT_KEY        = 'admin:reindex'

export async function POST(request: Request) {
    // ── 1. Fail-closed: require env var ──────────────────────────────────────
    // If ADMIN_SECRET_KEY is not configured the endpoint must refuse all
    // requests.  An unconfigured secret means any caller would pass — worse
    // than no endpoint at all.
    const configuredSecret = process.env.ADMIN_SECRET_KEY
    if (!configuredSecret || configuredSecret.trim() === '') {
        console.error('[Admin:Reindex] ADMIN_SECRET_KEY is not configured — rejecting all requests.')
        return NextResponse.json(
            { error: 'Endpoint not configured' },
            { status: 403 }
        )
    }

    // ── 2. Validate x-admin-secret ───────────────────────────────────────────
    const providedSecret = request.headers.get('x-admin-secret')
    if (!providedSecret || providedSecret.trim() !== configuredSecret.trim()) {
        // Log the attempt without echoing the provided value
        console.warn('[Admin:Reindex] Rejected request — invalid or missing x-admin-secret.')
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        )
    }

    // ── 3. Rate limiting ─────────────────────────────────────────────────────
    // Keyed on a fixed string — applies globally across all callers.
    // This prevents a valid secret holder from hammering OpenAI billing.
    try {
        rateLimit(RATE_LIMIT_KEY, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
    } catch {
        return NextResponse.json(
            { error: 'Too many reindex requests. Wait 10 minutes.' },
            { status: 429 }
        )
    }

    // ── 4. Execute backfill ──────────────────────────────────────────────────
    try {
        console.log('[Admin:Reindex] Starting semantic backfill...')

        const supabase = await getAdminClient()
        const { data: skills, error } = await supabase
            .from('skills')
            .select('id, title, description, instructions') as {
                data: Array<{
                    id: string
                    title: string
                    description: string | null
                    instructions: string | null
                }> | null
                error: unknown
            }

        if (error) {
            console.error('[Admin:Reindex] Fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
        }

        const skillsList = skills || []
        console.log(`[Admin:Reindex] Processing ${skillsList.length} skills...`)

        const results: Array<{ id: string; success: boolean }> = []

        for (const skill of skillsList) {
            if (!skill?.id) continue

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/skills/semantic-search`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type':  'application/json',
                            // Forward the admin secret so the PUT endpoint's
                            // ownership check is bypassed for server-side calls.
                            // The PUT endpoint validates the secret independently.
                            'x-admin-secret': configuredSecret,
                        },
                        body: JSON.stringify({
                            skillId:      skill.id,
                            title:        skill.title,
                            description:  skill.description  || '',
                            instructions: skill.instructions || '',
                        }),
                    }
                )

                results.push({ id: skill.id, success: response.ok })
            } catch (err) {
                console.error(`[Admin:Reindex] Failed to index skill ${skill.id}:`, err)
                results.push({ id: skill.id, success: false })
            }
        }

        return NextResponse.json({
            message:       'Backfill completed',
            processed:     results.length,
            success_count: results.filter(r => r.success).length,
            results,
        })

    } catch (error) {
        console.error('[Admin:Reindex] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
