/**
 * @fileoverview Security Layer Regression Tests
 * @description Verifies the auth fix (SSR client), withSecurity HOF contract,
 *              tenant isolation, and rate-limiting behaviour.
 *
 * These tests use Jest mocks to avoid real network/DB calls.
 * Every test documents WHY it exists — mapping back to the original P0 bug.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Module mocks — must be declared BEFORE imports
// ─────────────────────────────────────────────────────────────────────────────

// Mock Supabase SSR client (lib/supabase-server.ts)
jest.mock('@/lib/supabase-server', () => ({
    createClient: jest.fn(),
}))

// Mock admin client (lib/supabase/server.ts) — used by getUserCompany
jest.mock('@/lib/supabase/server', () => ({
    getAdminClient: jest.fn(),
}))

// Mock audit logger to avoid DB calls in unit tests
jest.mock('@/lib/security/audit', () => ({
    logAction: jest.fn().mockResolvedValue(undefined),
}))

import { createClient }    from '@/lib/supabase-server'
import { getAdminClient }  from '@/lib/supabase/server'
import { getAuthenticatedUser }          from '@/lib/security/auth'
import { getUserCompany, validateSameCompany } from '@/lib/security/tenant'
import { withSecurity }                  from '@/lib/security/withSecurity'
import { rateLimit }                     from '@/lib/security/rate-limit'
import { NextRequest }                   from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const mockUser = {
    id:    'user-uuid-123',
    email: 'tech@nexus.ai',
    role:  'authenticated',
    aud:   'authenticated',
    created_at: new Date().toISOString(),
}

const mockMembership = { company_id: 'company-uuid-abc', role: 'member' }

function makeNextRequest(
    method = 'POST',
    body: Record<string, unknown> = {},
    url = 'http://localhost/api/test'
): NextRequest {
    return new NextRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Cookie': 'sb-token=mock' },
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
    })
}

function makeMockSsrClient(user: typeof mockUser | null, error: unknown = null) {
    return {
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data:  { user },
                error,
            }),
        },
    }
}

function makeMockAdminClient(data: Record<string, unknown> | null, error: unknown = null) {
    return {
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq:     jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data, error }),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: getAuthenticatedUser — the P0 fix
// ─────────────────────────────────────────────────────────────────────────────

describe('getAuthenticatedUser', () => {

    /**
     * ROOT CAUSE TEST:
     * Before fix: getAdminClient() was used. Admin client has no session context
     * → getUser() always returned user:null → every request got 401.
     * After fix: createClient() (SSR) reads session from request cookies.
     */
    it('uses SSR client (createClient), NOT admin client', async () => {
        const mockSsr = makeMockSsrClient(mockUser)
        ;(createClient as jest.Mock).mockResolvedValue(mockSsr)
        ;(getAdminClient as jest.Mock).mockRejectedValue(new Error('Should not be called'))

        await getAuthenticatedUser()

        expect(createClient).toHaveBeenCalledTimes(1)
        expect(getAdminClient).not.toHaveBeenCalled()
    })

    it('returns the user object on valid session', async () => {
        ;(createClient as jest.Mock).mockResolvedValue(makeMockSsrClient(mockUser))

        const user = await getAuthenticatedUser()

        expect(user.id).toBe(mockUser.id)
        expect(user.email).toBe(mockUser.email)
    })

    it('throws Unauthorized when session has no user', async () => {
        ;(createClient as jest.Mock).mockResolvedValue(makeMockSsrClient(null))

        await expect(getAuthenticatedUser()).rejects.toThrow('Unauthorized')
    })

    it('throws Unauthorized when SSR client returns an auth error', async () => {
        ;(createClient as jest.Mock).mockResolvedValue(
            makeMockSsrClient(null, { message: 'jwt expired' })
        )

        await expect(getAuthenticatedUser()).rejects.toThrow('Unauthorized')
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: getUserCompany — admin client is correct here (intentional)
// ─────────────────────────────────────────────────────────────────────────────

describe('getUserCompany', () => {

    /**
     * Tenant lookup MUST use the admin client to bypass per-user RLS.
     * Without it, a user who isn't yet in company_members would get a
     * permission-denied error instead of a clean "Tenant not found".
     */
    it('uses admin client (intentional — RLS bypass for tenant resolution)', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient(mockMembership)
        )

        await getUserCompany(mockUser.id)

        expect(getAdminClient).toHaveBeenCalledTimes(1)
    })

    it('returns company_id and role on success', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient(mockMembership)
        )

        const result = await getUserCompany(mockUser.id)

        expect(result.company_id).toBe('company-uuid-abc')
        expect(result.role).toBe('member')
    })

    it('throws Tenant not found when user has no company', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient(null, { message: 'no rows' })
        )

        await expect(getUserCompany(mockUser.id)).rejects.toThrow('Tenant not found')
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: validateSameCompany — cross-tenant guard
// ─────────────────────────────────────────────────────────────────────────────

describe('validateSameCompany', () => {

    it('passes when both users belong to the same company', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient({ company_id: 'company-uuid-abc' })
        )

        await expect(
            validateSameCompany('company-uuid-abc', 'other-user-id')
        ).resolves.not.toThrow()
    })

    it('throws Cross-tenant access denied when company IDs differ', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient({ company_id: 'DIFFERENT-company' })
        )

        await expect(
            validateSameCompany('company-uuid-abc', 'attacker-id')
        ).rejects.toThrow('Cross-tenant access denied')
    })

    it('throws Cross-tenant access denied when target has null company_id', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient({ company_id: null })
        )

        await expect(
            validateSameCompany('company-uuid-abc', 'unassigned-user')
        ).rejects.toThrow('Cross-tenant access denied')
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: withSecurity HOF — full pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('withSecurity', () => {

    beforeEach(() => {
        jest.clearAllMocks()
        ;(createClient as jest.Mock).mockResolvedValue(makeMockSsrClient(mockUser))
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient(mockMembership)
        )
    })

    it('calls handler with correct SecurityContext when user is authenticated', async () => {
        const mockHandler = jest.fn().mockResolvedValue({ ok: true })
        const wrappedRoute = withSecurity(mockHandler)

        const req = makeNextRequest('POST', { data: 'test' })
        const res = await wrappedRoute(req)

        expect(mockHandler).toHaveBeenCalledTimes(1)
        const [callArgs] = mockHandler.mock.calls
        expect(callArgs[0].ctx.userId).toBe(mockUser.id)
        expect(callArgs[0].ctx.companyId).toBe(mockMembership.company_id)
        expect(callArgs[0].ctx.role).toBe(mockMembership.role)
        expect(res.status).toBe(200)
    })

    it('returns 401 when session is absent (no cookies)', async () => {
        ;(createClient as jest.Mock).mockResolvedValue(makeMockSsrClient(null))

        const wrappedRoute = withSecurity(jest.fn())
        const res = await wrappedRoute(makeNextRequest())
        const json = await res.json()

        expect(res.status).toBe(401)
        expect(json.security_alert).toBe(true)
        expect(json.error).toContain('Unauthorized')
    })

    it('returns 403 when user has no company membership (tenant not found)', async () => {
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient(null, { message: 'no rows' })
        )

        const wrappedRoute = withSecurity(jest.fn())
        const res = await wrappedRoute(makeNextRequest())
        const json = await res.json()

        // "Tenant not found" contains "Tenant" → mapped to 403 (access denied, not a server fault)
        expect(res.status).toBe(403)
        expect(json.security_alert).toBe(true)
    })

    it('returns 403 when handler throws Forbidden', async () => {
        const wrappedRoute = withSecurity(async () => {
            throw new Error('Forbidden: insufficient permissions')
        })

        const res = await wrappedRoute(makeNextRequest())
        expect(res.status).toBe(403)
    })

    it('passes body to handler for POST requests', async () => {
        const mockHandler = jest.fn().mockResolvedValue({})
        const wrappedRoute = withSecurity(mockHandler)

        const payload = { techId: 't-001', type: 'COMMAND' }
        await wrappedRoute(makeNextRequest('POST', payload))

        const callBody = mockHandler.mock.calls[0][0].body
        expect(callBody.techId).toBe('t-001')
        expect(callBody.type).toBe('COMMAND')
    })

    it('passes empty body for GET requests', async () => {
        const mockHandler = jest.fn().mockResolvedValue({})
        const wrappedRoute = withSecurity(mockHandler)

        await wrappedRoute(makeNextRequest('GET', {}, 'http://localhost/api/test'))

        const callBody = mockHandler.mock.calls[0][0].body
        expect(callBody).toEqual({})
    })

    it('handler receives NextRequest instance', async () => {
        const mockHandler = jest.fn().mockResolvedValue({})
        const wrappedRoute = withSecurity(mockHandler)

        const req = makeNextRequest('POST')
        await wrappedRoute(req)

        const passedReq = mockHandler.mock.calls[0][0].req
        expect(passedReq).toBeInstanceOf(NextRequest)
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Rate Limiting — isolation between users
// ─────────────────────────────────────────────────────────────────────────────

describe('rateLimit', () => {

    it('does not throw within the allowed limit', () => {
        const key = `test-rl-${Date.now()}`
        expect(() => {
            for (let i = 0; i < 5; i++) rateLimit(key, 5)
        }).not.toThrow()
    })

    it('throws Rate limit exceeded after exceeding the limit', () => {
        const key = `test-rl-exceeded-${Date.now()}`
        expect(() => {
            for (let i = 0; i < 6; i++) rateLimit(key, 5)
        }).toThrow('Rate limit exceeded')
    })

    it('rate limit is per-user — different keys are independent', () => {
        const keyA = `rl-userA-${Date.now()}`
        const keyB = `rl-userB-${Date.now()}`

        // Fill keyA to its limit
        for (let i = 0; i < 5; i++) rateLimit(keyA, 5)

        // keyB should be completely unaffected
        expect(() => rateLimit(keyB, 5)).not.toThrow()
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Regression — the original P0 scenario end-to-end
// ─────────────────────────────────────────────────────────────────────────────

describe('P0 Regression — admin client must NOT be used for session validation', () => {

    /**
     * This is the exact scenario that caused every withSecurity route to
     * return 401: the admin client (service_role key) was used to call
     * getUser(), which has no session context and always returns null.
     *
     * This test permanently guards against regression.
     */
    it('authenticated user successfully reaches the handler — never blocked by admin-client auth', async () => {
        // SSR client finds a valid session in cookies
        ;(createClient as jest.Mock).mockResolvedValue(makeMockSsrClient(mockUser))
        // Admin client resolves the company membership
        ;(getAdminClient as jest.Mock).mockResolvedValue(
            makeMockAdminClient(mockMembership)
        )

        const handler = jest.fn().mockResolvedValue({ reached: true })
        const wrappedRoute = withSecurity(handler)
        const res = await wrappedRoute(makeNextRequest())
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.reached).toBe(true)
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('REGRESSION: admin-client-only scenario returns 401 (simulates pre-fix state)', async () => {
        // Simulate what happened before: admin client returns user:null
        // (because it has no session context even when a valid user is logged in)
        ;(createClient as jest.Mock).mockResolvedValue(makeMockSsrClient(null))

        const handler = jest.fn()
        const wrappedRoute = withSecurity(handler)
        const res = await wrappedRoute(makeNextRequest())

        expect(res.status).toBe(401)
        expect(handler).not.toHaveBeenCalled() // handler must never be reached
    })
})
