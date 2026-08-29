import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUser } from './auth';
import { getUserCompany } from './tenant';
import { rateLimit } from './rate-limit';
import { logAction } from './audit';

export interface SecurityContext {
    userId: string;
    companyId: string;
    role: string;
}

export type SecuredHandler = (params: {
    ctx: SecurityContext,
    body: Record<string, unknown>,
    req: NextRequest
}) => Promise<unknown>;

/**
 * 🔒 withSecurity (HOF) — Zero-Trust Enforcement Layer
 *
 * Wraps an API Route Handler with:
 *   1. SSR session validation  (reads JWT from request cookies)
 *   2. Tenant resolution       (admin client — RLS bypass intentional)
 *   3. Per-user rate limiting
 *   4. Auto-audit logging      (EU AI Act compliance)
 *
 * The handler signature uses NextRequest so the SSR client can access
 * request cookies via next/headers which are bound to the current
 * request context by the Next.js App Router.
 */
export function withSecurity(handler: SecuredHandler) {
    return async (req: NextRequest) => {
        try {
            // ── 1. Identity ─────────────────────────────────────────────────
            // getAuthenticatedUser() calls createClient() from lib/supabase-server.ts
            // which reads cookies() — automatically scoped to this request by
            // Next.js App Router. No JWT forwarding needed.
            const user = await getAuthenticatedUser()

            // ── 2. Tenant Resolution ────────────────────────────────────────
            // Uses admin client intentionally: company_members lookup must
            // bypass per-user RLS to avoid a chicken-and-egg auth loop.
            const membership = await getUserCompany(user.id)
            const ctx: SecurityContext = {
                userId:    user.id,
                companyId: membership.company_id,
                role:      membership.role,
            }

            // ── 3. Rate Limiting ────────────────────────────────────────────
            rateLimit(user.id, 50)

            // ── 4. Body Extraction (Safe) ───────────────────────────────────
            let body: Record<string, unknown> = {}
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                body = await req.json().catch(() => ({}))
            }

            // ── 5. Handler Execution ────────────────────────────────────────
            const result = await handler({ ctx, body, req })

            // ── 6. Auto-Audit ───────────────────────────────────────────────
            await logAction({
                userId: ctx.userId,
                action: `API_CALL_${req.method}_${new URL(req.url).pathname}`,
                metadata: {
                    companyId:    ctx.companyId,
                    status:       'SUCCESS',
                    payload_keys: Object.keys(body),
                },
            })

            return NextResponse.json(result)

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Internal error'
            console.error(`[Security Wrapper] Violation: ${message}`)

            const status =
                message.includes('Forbidden') || message.includes('Denied')     ? 403 :
                message.includes('Unauthorized')                                 ? 401 :
                message.includes('Rate limit')                                   ? 429 :
                message.includes('Tenant')                                       ? 403 : 500

            return NextResponse.json(
                { error: message, security_alert: true },
                { status }
            )
        }
    }
}
