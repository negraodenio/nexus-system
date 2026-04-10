/**
 * Nexus Real-Time Protocol v1.0
 * Standardizes messages between Expert Dashboard and Field Assistant
 */

export type NexusCommandType = 'HIGHLIGHT' | 'WARNING' | 'APPROVE' | 'OVERRIDE';

export interface NexusRealtimeMessage {
    type: NexusCommandType;
    payload: {
        x?: number; // Normalized 0-1
        y?: number; // Normalized 0-1
        message: string;
        timestamp: number;
    };
    techId: string;
    expertId: string;
}

export const NEXUS_CHANNELS = {
    // We use UUIDs (Tech UID or Company ID) to make channels unguessable
    SUPPORT: (id: string) => `nexus:support:${id}`
};
