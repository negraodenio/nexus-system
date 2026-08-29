/**
 * @fileoverview Semantic Search PUT endpoint — Embedding Poisoning Protection Tests
 *
 * Covers every security gate in PUT /api/skills/semantic-search:
 *
 *   Gate 1  Authentication         — anonymous requests → 401
 *   Gate 2  Ownership              — non-owner attempts → 403
 *   Gate 3  Company isolation      — cross-company attempts → 403
 *   Happy   Owner + same company   — succeeds → 200
 *   Edge    Skill not found        — unknown skillId → 403 (oracle-safe)
 *   Edge    Skill has no company   — personal skill, no company check → 200
 *   Edge    Missing content fields — valid owner, no embeddable text → 400
 */

// ─────────────────────────────────────────────────────────────────────────────
// Mocks — declared before any imports
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }))
jest.mock('@/lib/supabase/server',  () => ({ getAdminClient: jest.fn() }))
jest.mock('openai')   // auto-mock — we configure it per-test in beforeEach

import { createClient }   from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase/server'
import OpenAI             from 'openai'
import { PUT }            from '@/app/api/skills/semantic-search/route'

// jest.mock('openai') auto-mocks the module.  We configure the constructor
// to return a working embeddings.create in beforeEach.
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const OWNER_ID       = 'user-owner-uuid'
const OTHER_USER_ID  = 'user-other-uuid'
const COMPANY_A_ID   = 'company-a-uuid'
const COMPANY_B_ID   = 'company-b-uuid'
const SKILL_ID       = 'skill-uuid-001'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makePutRequest(body: Record<string, unknown>): Request {
    return new Request('http://localhost/api/skills/semantic-search', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    })
}

/**
 * Builds a mock SSR client.
 *
 * @param user         - authenticated user or null (unauthenticated)
 * @param skillRow     - row returned by the ownership SELECT, or null
 */
function mockSsrClient(
    user: { id: string } | null,
    skillRow: { creator_id: string | null; company_id: string | null } | null
) {
    const singleFn = jest.fn().mockResolvedValue({
        data:  skillRow,
        error: skillRow ? null : { message: 'no rows found' },
    })

    return {
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data:  { user },
                error: user ? null : { message: 'no session' },
            }),
        },
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq:     jest.fn().mockReturnThis(),
            single: singleFn,
        }),
    }
}

/**
 * Builds a mock admin client.
 *
 * @param membershipRow - company_members row for the caller, or null (not a member)
 * @param upsertError   - optional upsert failure to simulate DB error
 *
 * The admin client is called in two distinct situations in the PUT handler:
 *   1. Gate 3 company check: from('company_members').select().eq().single()
 *   2. Upsert:               from('skill_embeddings').upsert()
 *
 * Both must be wired up because getAdminClient() may be called up to twice
 * per request (once per situation).  We use mockResolvedValueOnce so each
 * call in sequence receives the right mock instance.
 */
function mockAdminClient(
    membershipRow: { company_id: string } | null,
    upsertError: { message: string } | null = null
) {
    const membershipSingle = jest.fn().mockResolvedValue({
        data:  membershipRow,
        error: membershipRow ? null : { message: 'no membership' },
    })

    const upsertFn = jest.fn().mockResolvedValue({ error: upsertError })

    // Single factory — routes by table name
    const fromFn = jest.fn().mockImplementation((table: string) => {
        if (table === 'company_members') {
            return {
                select: jest.fn().mockReturnThis(),
                eq:     jest.fn().mockReturnThis(),
                single: membershipSingle,
            }
        }
        // skill_embeddings
        return { upsert: upsertFn }
    })

    return { from: fromFn, _upsertFn: upsertFn }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('PUT /api/skills/semantic-search — Embedding Poisoning Protection', () => {

    const validBody = {
        skillId:      SKILL_ID,
        title:        'Fiber optic fusion',
        description:  'Procedure for single-mode fusion splicing',
        instructions: 'Clean → Cleave → Fuse → Protect',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.OPENAI_API_KEY = 'sk-test-key'

        // Wire up OpenAI so that new OpenAI() returns an instance whose
        // embeddings.create() resolves with a dummy 1536-dim vector.
        MockedOpenAI.mockImplementation(() => ({
            embeddings: {
                create: jest.fn().mockResolvedValue({
                    data: [{ embedding: new Array(1536).fill(0.1) }],
                }),
            },
        }) as unknown as OpenAI)
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Gate 1: Authentication
    // ─────────────────────────────────────────────────────────────────────────

    describe('Gate 1 — Authentication', () => {

        it('returns 401 for anonymous request (no session)', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(null, null)
            )

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(401)
            expect(json.error).toBe('Unauthorized')
        })

        it('does NOT call getAdminClient when unauthenticated', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(null, null)
            )

            await PUT(makePutRequest(validBody))

            expect(getAdminClient).not.toHaveBeenCalled()
        })

        it('returns 400 for missing skillId even before auth', async () => {
            // skillId check happens before auth — no mock needed
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(null, null)
            )

            const res  = await PUT(makePutRequest({ title: 'no skill id' }))
            const json = await res.json()

            expect(res.status).toBe(400)
            expect(json.error).toBe('skillId is required')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Gate 2: Ownership
    // ─────────────────────────────────────────────────────────────────────────

    describe('Gate 2 — Ownership', () => {

        it('returns 403 when skill belongs to a different user (public skill)', async () => {
            // Skill IS visible (returned by RLS) but owned by OTHER_USER_ID
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OTHER_USER_ID, company_id: null }
                )
            )

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toContain('only the skill creator')
        })

        it('returns 403 (oracle-safe) when skill is invisible under RLS (private, different tenant)', async () => {
            // RLS returns zero rows — the SSR single() resolves with error
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    null          // no row returned — skill is invisible
                )
            )

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(403)
            // Same message as "not found" — caller cannot distinguish
            expect(json.error).toBe('Skill not found or access denied')
        })

        it('returns 403 for completely unknown skillId', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    null   // skill doesn't exist at all
                )
            )

            const res  = await PUT(makePutRequest({ ...validBody, skillId: 'nonexistent-id' }))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toBe('Skill not found or access denied')
        })

        it('does NOT call getAdminClient when ownership check fails', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OTHER_USER_ID, company_id: COMPANY_A_ID }
                )
            )

            await PUT(makePutRequest(validBody))

            expect(getAdminClient).not.toHaveBeenCalled()
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Gate 3: Company isolation
    // ─────────────────────────────────────────────────────────────────────────

    describe('Gate 3 — Company isolation', () => {

        it('returns 403 when caller was removed from the skill company', async () => {
            // Caller IS the creator but no longer belongs to company A
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: COMPANY_A_ID }
                )
            )
            // Only one getAdminClient call — company check returns no membership
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminClient(null)  // no membership found
            )

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toContain('your company does not own this skill')
        })

        it('returns 403 when caller belongs to Company B, skill belongs to Company A', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: COMPANY_A_ID }
                )
            )
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminClient({ company_id: COMPANY_B_ID })  // caller is in B, skill is in A
            )

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(403)
            expect(json.error).toContain('your company does not own this skill')
        })

        it('skips company check for personal skills (no company_id)', async () => {
            // Skill has no company — personal skill, no company check needed
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: null }
                )
            )
            // getAdminClient called ONCE — only for the upsert (no company check)
            const adminMock = mockAdminClient(null, null)
            ;(getAdminClient as jest.Mock).mockResolvedValue(adminMock)

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.success).toBe(true)
        })

        it('does NOT call company_members check when skill has no company_id', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: null }
                )
            )
            const adminMock = mockAdminClient(null, null)
            ;(getAdminClient as jest.Mock).mockResolvedValue(adminMock)

            await PUT(makePutRequest(validBody))

            // Admin client is called once for the upsert, but NOT for company_members
            const fromCalls = (adminMock.from as jest.Mock).mock.calls.map(
                (c: unknown[]) => c[0]
            )
            expect(fromCalls).not.toContain('company_members')
            expect(fromCalls).toContain('skill_embeddings')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Happy path: owner + same company
    // ─────────────────────────────────────────────────────────────────────────

    describe('Happy path — owner update succeeds', () => {

        it('returns 200 when caller is owner AND belongs to same company', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: COMPANY_A_ID }
                )
            )
            // getAdminClient is called twice:
            //   call 1 → company_members check (Gate 3)
            //   call 2 → skill_embeddings upsert
            const membershipAdmin = mockAdminClient({ company_id: COMPANY_A_ID })
            const upsertAdmin     = mockAdminClient(null, null)
            ;(getAdminClient as jest.Mock)
                .mockResolvedValueOnce(membershipAdmin)
                .mockResolvedValueOnce(upsertAdmin)

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.success).toBe(true)
            expect(json.skillId).toBe(SKILL_ID)
        })

        it('calls skill_embeddings upsert exactly once on success', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: COMPANY_A_ID }
                )
            )
            const membershipAdmin = mockAdminClient({ company_id: COMPANY_A_ID })
            const upsertAdmin     = mockAdminClient(null, null)
            ;(getAdminClient as jest.Mock)
                .mockResolvedValueOnce(membershipAdmin)
                .mockResolvedValueOnce(upsertAdmin)

            await PUT(makePutRequest(validBody))

            const upsertCalls = (upsertAdmin.from as jest.Mock).mock.calls.filter(
                (c: unknown[]) => c[0] === 'skill_embeddings'
            )
            expect(upsertCalls).toHaveLength(1)
        })

        it('returns 400 when all content fields are empty (no text to embed)', async () => {
            // Auth + ownership pass, but no title/description/instructions
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: null }
                )
            )
            // No getAdminClient call expected (400 before upsert)

            const res  = await PUT(makePutRequest({ skillId: SKILL_ID }))
            const json = await res.json()

            expect(res.status).toBe(400)
            expect(json.error).toBe('No content to embed')
        })

        it('returns 500 when embedding upsert fails', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: null }  // personal skill
                )
            )
            // Only one getAdminClient call — personal skill skips membership check
            const upsertAdmin = mockAdminClient(null, { message: 'duplicate key' })
            ;(getAdminClient as jest.Mock).mockResolvedValue(upsertAdmin)

            const res  = await PUT(makePutRequest(validBody))
            const json = await res.json()

            expect(res.status).toBe(500)
            expect(json.error).toBe('Failed to save embedding')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Attack scenario summary — all three attack vectors blocked
    // ─────────────────────────────────────────────────────────────────────────

    describe('Attack scenario — embedding poisoning blocked', () => {

        it('ATTACK 1: anonymous request is blocked at Gate 1', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(mockSsrClient(null, null))
            const res = await PUT(makePutRequest(validBody))
            expect(res.status).toBe(401)
        })

        it('ATTACK 2: authenticated user poisoning another users skill is blocked at Gate 2', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: 'attacker-id' },
                    { creator_id: OWNER_ID, company_id: null }  // visible (public) but different creator
                )
            )
            const res = await PUT(makePutRequest(validBody))
            expect(res.status).toBe(403)
        })

        it('ATTACK 3: creator from Company B poisoning Company A skill is blocked at Gate 3', async () => {
            ;(createClient as jest.Mock).mockResolvedValue(
                mockSsrClient(
                    { id: OWNER_ID },
                    { creator_id: OWNER_ID, company_id: COMPANY_A_ID }
                )
            )
            ;(getAdminClient as jest.Mock).mockResolvedValue(
                mockAdminClient({ company_id: COMPANY_B_ID })
            )
            const res = await PUT(makePutRequest(validBody))
            expect(res.status).toBe(403)
        })
    })
})
