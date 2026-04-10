import { withSecurity, logAction, enforceTenant } from '@/lib/security'
import { predictMotion } from '@/lib/ai-client'
import { getAdminClient } from '@/lib/supabase/server'

/**
 * 🤖 NEXUS MOTION PREDICTION (ENFORCED ZERO TRUST)
 */
export const POST = withSecurity(async ({ ctx, body }) => {
    const { emgEmbedding, currentLandmarks, prompt, companyId: inputCompanyId } = body

    // 1. Mandatory Tenant Enforcement (Prevent accidental leakage)
    enforceTenant(ctx.companyId, inputCompanyId);

    // 2. AI Safety: Prompt Injection Guardrail
    const maliciousPattern = /ignore previous instructions|act as/i;
    if (prompt && maliciousPattern.test(prompt)) {
        await logAction({ userId: ctx.userId, action: 'SECURITY_ALERT_INJECTION', metadata: { prompt } });
        throw new Error('Security Violation: Malicious prompt rejected');
    }

    if (!emgEmbedding || !currentLandmarks) {
        throw new Error('Missing emgEmbedding or currentLandmarks');
    }

    // 3. SECURE RAG (Filtered by Server-Derived Tenant)
    let ragContext = "No similar patterns found in database."
    try {
        const supabase = await getAdminClient()
        const { data: patterns, error } = await supabase
            .rpc('match_emg_patterns', {
                query_embedding: emgEmbedding,
                p_company_id: ctx.companyId, // USE CONTEXT ID
                match_threshold: 0.75,
                match_count: 3
            })

        if (!error && patterns && patterns.length > 0) {
            ragContext = patterns.map((p: any) => 
                `Pattern: ${p.label}. Metadata: ${JSON.stringify(p.metadata)}`
            ).join('\n')
        }
    } catch (ragErr) {
        console.warn('Neuromuscular RAG match failed (non-fatal):', ragErr)
    }

    // 4. Prediction via MiniMax M2.7
    const prediction = await predictMotion(currentLandmarks, ragContext)

    if (!prediction) throw new Error('Failed to generate motion prediction')

    return {
        source: 'neural-rag',
        ...prediction
    };
});
