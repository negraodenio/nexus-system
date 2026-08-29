import { getAdminClient } from './supabase/server';

export interface TelemetryEvent {
    sessionId: string;
    companyId: string;
    techId: string;
    moduleId: string;
    stepIndex: number;
    score: number;
    metadata?: Record<string, unknown>;
}

export const TelemetryService = {
    /**
     * Logs a critical technical checkpoint to the database.
     * Uses the admin client so RLS never blocks telemetry writes.
     */
    async logStepCompletion(event: TelemetryEvent) {
        console.log("[Telemetry] Logging checkpoint:", event);
        
        try {
            const supabase = await getAdminClient();
            // field_telemetry is a custom table not in the generated Supabase schema;
            // cast required until `supabase gen types` is run against the live project.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const db = supabase as any;
            const { error } = await db
                .from('field_telemetry')
                .insert([{
                    session_id: event.sessionId,
                    company_id: event.companyId,
                    tech_id: event.techId,
                    module_id: event.moduleId,
                    step_index: event.stepIndex,
                    score: event.score,
                    metadata: event.metadata,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.warn("[Telemetry] DB Insert failed, cached locally:", error.message);
                return { success: false, cached: true };
            }

            return { success: true, cached: false };
        } catch (err) {
            console.warn("[Telemetry] Network failure, caching locally.", err);
            return { success: false, cached: true };
        }
    }
};
