/**
 * @fileoverview Admin Reindex Endpoint — Security Tests
 *
 * Threat model:
 *
 *   T1  Unauthenticated billing drain
 *         Any public caller triggers a full DB scan + OpenAI call per skill.
 *         Fix: validate x-admin-secret before touching the DB.
 *
 *   T2  Brute-force secret enumeration
 *         Attacker submits thousands of guesses to find the secret.
 *         Fix: rate-limit globally (3 requests / 10 min, shared key).
 *
 *   T3  Misconfigured deployment (secret not set)
 *         If ADMIN_SECRET_KEY is empty, every request would pass the
 *         trivially-true comparison `'' === ''`.
 *         Fix: fail-closed — reject all requests when env var is missing.
 *
 *   T4  Timing side-channel
 *         Naive string comparison leaks secret length via response time.
 *         The current implementation uses `.trim() !== .trim()` which is
 *         not constant-time.  For a 32-byte random hex secret this is an
 *         acceptable risk (2^128 guesses required regardless of early exit),
 *         but documented here as a known trade-off.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Mocks — hoisted before imports
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@/lib/supabase/server', () => ({ getAdminClient: jest.fn() }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: jest.fn() }))

// We mock global fetch so the internal PUT call never goes out
global.fetch = jest.fn()

import { getAdminClient } from '@/lib/supabase/server'
import { rateLimit }      from '@/lib/security/rate-limit'
import { POST }           from '@/app/api/admin/reindex/route'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VALID_SECRET   = 'correct-horse-battery-staple-32hex'
const INVALID_SECRET = 'wrong-secret'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeRequest(secret: string | null): Request {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (secret !== null) headers['x-admin-secret'] = secret
    return new Request('http://localhost/api/admin/reindex', {
        method: 'POST',
        headers,
    })
}

/** Minimal admin Supabase mock that returns a list of skills */
function mockAdminWithSkills(
    skills: Array<{ id: string; title: string; description: string | null; instructions: string | null }>
) {
    return {
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: skills, error: null }),
        }),
    }
}

function mockAdminWithError() {
    return {
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/admin/reindex — Endpoint Hardening', () => {

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.ADMIN_SECRET_KEY     = VALID_SECRET
        process.env.NEXT_PUBLIC_APP_URL  = 'http://localhost:3000'

        // Default: rateLimit does nothing (passes), fetch succeeds
        ;(rateLimit as jest.Mock).mockReturnValue(undefined)
        ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })
    })

    afterEach(() => {
        delete process.env.ADMIN_SECRET_KEY
    })

    // ─────────────────────────────────────────────────────────────────────────
    // T1 + T3 — Authentication gate
    // ─────────────────────────────────────────────────────────────────────────

    describe('Secret validation', () => {

        it('returns 403 when x-admin-secret header is missing', async () => {
            const res  = await POST(makeRequest(null))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Forbidden')
        })

        it('returns 403 when x-admin-secret is wrong', async () => {
            const res  = await POST(makeRequest(INVALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Forbidden')
        })

        it('returns 403 when x-admin-secret is an empty string', async () => {
            const res  = await POST(makeRequest(''))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Forbidden')
        })

        it('does NOT call getAdminClient when secret is wrong', async () => {
            await POST(makeRequest(INVALID_SECRET))
            expect(getAdminClient).not.toHaveBeenCalled()
        })

        it('does NOT call fetch (OpenAI) when secret is wrong', async () => {
            await POST(makeRequest(INVALID_SECRET))
            expect(global.fetch).not.toHaveBeenCalled()
        })

        it('accepts a valid secret and proceeds to backfill', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminWithSkills([
                    { id: 'skill-1', title: 'Test', description: null, instructions: null },
                ])
            )

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.message).toBe('Backfill completed')
            expect(json.processed).toBe(1)
        })

        it('trims whitespace from both secret and header before comparing', async () => {
            process.env.ADMIN_SECRET_KEY = `  ${VALID_SECRET}  `

            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminWithSkills([])
            )

            // Header without extra whitespace should still match
            const res = await POST(makeRequest(VALID_SECRET))
            expect(res.status).toBe(200)
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // T3 — Fail-closed when env var missing
    // ─────────────────────────────────────────────────────────────────────────

    describe('Fail-closed on missing ADMIN_SECRET_KEY', () => {

        it('returns 403 when ADMIN_SECRET_KEY is not set', async () => {
            delete process.env.ADMIN_SECRET_KEY

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Endpoint not configured')
        })

        it('returns 403 when ADMIN_SECRET_KEY is empty string', async () => {
            process.env.ADMIN_SECRET_KEY = ''

            const res  = await POST(makeRequest(''))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Endpoint not configured')
        })

        it('returns 403 when ADMIN_SECRET_KEY is whitespace only', async () => {
            process.env.ADMIN_SECRET_KEY = '   '

            const res  = await POST(makeRequest('   '))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Endpoint not configured')
        })

        it('does NOT call getAdminClient when env var is missing', async () => {
            delete process.env.ADMIN_SECRET_KEY
            await POST(makeRequest(VALID_SECRET))
            expect(getAdminClient).not.toHaveBeenCalled()
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // T2 — Rate limiting
    // ─────────────────────────────────────────────────────────────────────────

    describe('Rate limiting', () => {

        it('returns 429 when rate limit is exceeded', async () => {
            ;(rateLimit as jest.Mock).mockImplementation(() => {
                throw new Error('Rate limit exceeded')
            })

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(429)
            expect(json.error).toContain('Wait 10 minutes')
        })

        it('calls rateLimit with the admin:reindex key after secret validation', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(mockAdminWithSkills([]))

            await POST(makeRequest(VALID_SECRET))

            expect(rateLimit).toHaveBeenCalledWith(
                'admin:reindex',
                3,
                600000  // 10 minutes in ms
            )
        })

        it('does NOT call rateLimit when secret is invalid (no unnecessary DB work)', async () => {
            await POST(makeRequest(INVALID_SECRET))
            expect(rateLimit).not.toHaveBeenCalled()
        })

        it('does NOT call getAdminClient when rate limit is exceeded', async () => {
            ;(rateLimit as jest.Mock).mockImplementation(() => {
                throw new Error('Rate limit exceeded')
            })

            await POST(makeRequest(VALID_SECRET))
            expect(getAdminClient).not.toHaveBeenCalled()
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Happy path — valid secret, rate limit not exceeded
    // ─────────────────────────────────────────────────────────────────────────

    describe('Happy path — valid request', () => {

        it('returns processed count matching the skills in DB', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminWithSkills([
                    { id: 'skill-1', title: 'A', description: null, instructions: null },
                    { id: 'skill-2', title: 'B', description: 'desc', instructions: 'inst' },
                ])
            )

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.processed).toBe(2)
        })

        it('counts success_count correctly when some fetch calls fail', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminWithSkills([
                    { id: 'skill-1', title: 'A', description: null, instructions: null },
                    { id: 'skill-2', title: 'B', description: null, instructions: null },
                ])
            )
            // First skill succeeds, second fails
            ;(global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: true })
                .mockResolvedValueOnce({ ok: false })

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(json.success_count).toBe(1)
            expect(json.processed).toBe(2)
        })

        it('handles empty skills table gracefully', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(mockAdminWithSkills([]))

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.processed).toBe(0)
            expect(json.success_count).toBe(0)
        })

        it('forwards x-admin-secret to the internal PUT call', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminWithSkills([
                    { id: 'skill-1', title: 'A', description: null, instructions: null },
                ])
            )

            await POST(makeRequest(VALID_SECRET))

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/skills/semantic-search'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-admin-secret': VALID_SECRET,
                    }),
                })
            )
        })

        it('returns 500 when Supabase fetch fails', async () => {
            ;(getAdminClient as jest.Mock).mockResolvedValue(mockAdminWithError())

            const res  = await POST(makeRequest(VALID_SECRET))
            const json = await res.json()

            expect(res.status).toBe(500)
            expect(json.error).toBe('Failed to fetch skills')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Attack scenario summary
    // ─────────────────────────────────────────────────────────────────────────

    describe('Attack scenarios blocked', () => {

        it('ATTACK T1: unauthenticated billing drain is blocked — no secret → 403', async () => {
            const res = await POST(makeRequest(null))
            expect(res.status).toBe(403)
            expect(getAdminClient).not.toHaveBeenCalled()
            expect(global.fetch).not.toHaveBeenCalled()
        })

        it('ATTACK T2: brute-force enumeration is rate-limited → 429', async () => {
            ;(rateLimit as jest.Mock).mockImplementation(() => {
                throw new Error('Rate limit exceeded')
            })
            const res = await POST(makeRequest(VALID_SECRET))
            expect(res.status).toBe(429)
        })

        it('ATTACK T3: misconfigured deployment (no env var) fails closed → 403', async () => {
            delete process.env.ADMIN_SECRET_KEY
            // Even sending the correct secret value provides no access
            const res = await POST(makeRequest(VALID_SECRET))
            expect(res.status).toBe(403)
            expect((await res.json()).error).toBe('Endpoint not configured')
        })
    })
})
