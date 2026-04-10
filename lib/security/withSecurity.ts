import { NextResponse } from 'next/server';
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
    body: any,
    req: Request 
}) => Promise<any>;

/**
 * 🔒 withSecurity (HOF) - The Enforcement Layer
 * Wraps an API handler with mandatory zero-trust controls.
 */
export function withSecurity(handler: SecuredHandler) {
    return async (req: Request) => {
        try {
            // 1. Mandatory Identity Check
            const user = await getAuthenticatedUser();
            
            // 2. Mandatory Tenant Identification
            const membership = await getUserCompany(user.id);
            const ctx: SecurityContext = {
                userId: user.id,
                companyId: membership.company_id,
                role: membership.role
            };

            // 3. Mandatory Rate Limiting
            rateLimit(user.id, 50);

            // 4. Body Extraction (Safe)
            const body = req.method === 'POST' || req.method === 'PUT' 
                ? await req.json().catch(() => ({})) 
                : {};

            // 5. Execute Handler
            const result = await handler({ ctx, body, req });

            // 6. AUTO-AUDIT (EU AI Act Compliance)
            // No developer action needed. Automatic traceability.
            await logAction({
                userId: ctx.userId,
                action: `API_CALL_${req.method}_${new URL(req.url).pathname}`,
                metadata: {
                    companyId: ctx.companyId,
                    status: 'SUCCESS',
                    payload_keys: Object.keys(body)
                }
            });

            return NextResponse.json(result);

        } catch (error: any) {
            console.error(`[Security Wrapper] Violation: ${error.message}`);
            
            const status = error.message.includes('Forbidden') || error.message.includes('Denied') ? 403 : 
                           error.message.includes('Unauthorized') ? 401 : 
                           error.message.includes('Rate limit') ? 429 : 500;
            
            return NextResponse.json({ 
                error: error.message,
                security_alert: true 
            }, { status });
        }
    };
}
