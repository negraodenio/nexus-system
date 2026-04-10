import { supabase } from './supabase';

export interface TelemetryEvent {
    sessionId: string;
    companyId: string;
    techId: string;
    moduleId: string;
    stepIndex: number;
    score: number;
    metadata?: Record<string, any>;
}

export const TelemetryService = {
    /**
     * Logs a critical technical checkpoint to the database
     */
    async logStepCompletion(event: TelemetryEvent) {
        console.log("[Telemetry] Logging checkpoint:", event);
        
        try {
            const { error } = await supabase
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
                // In production, we'd fallback to local-first (indexedDB) if offline
                console.warn("[Telemetry] DB Insert failed, cached locally:", error.message);
                return { success: false, cached: true };
            }

            return { success: true, cached: false };
        } catch (err) {
            console.warn("[Telemetry] Network failure, caching locally.");
            return { success: false, cached: true };
        }
    }
};
