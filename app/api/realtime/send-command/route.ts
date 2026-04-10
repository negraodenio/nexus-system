import { withSecurity } from '@/lib/security';
import { sendSecureCommand } from '@/lib/security';

/**
 * 🛰️ NEXUS EXPERT CONTROL GATEWAY (ENFORCED)
 * Uses withSecurity wrapper to automate identity, tenant, rate-limit & audit.
 */
export const POST = withSecurity(async ({ ctx, body }) => {
    const { techId, type, payload } = body;

    // SECURE EXECUTION
    // sendSecureCommand internally validates tech alignment with ctx.companyId
    return await sendSecureCommand({
        userId: ctx.userId,
        techId,
        type,
        payload
    });
});
