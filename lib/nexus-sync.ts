/**
 * NEXUS 3.0 - REAL-TIME SYNC ENGINE
 * Low-latency transport layer using Supabase Realtime Broadcast.
 * Focus: delta-compression and coordinate quantization.
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface SyncPacket {
    userId: string;
    roomId: string;
    landmarks: { x: number; y: number; z: number }[];
    timestamp: number;
}

export class NexusSyncEngine {
    private channel: RealtimeChannel | null = null;
    private onMessage: (packet: SyncPacket) => void = () => {};
    private lastSentAt: number = 0;
    private lastSentLandmarks: { x: number; y: number; z: number }[] | null = null;

    /**
     * Joins a specific room channel.
     */
    public async joinRoom(roomId: string, onData: (packet: SyncPacket) => void) {
        this.onMessage = onData;
        
        this.channel = supabase.channel(`room:${roomId}`, {
            config: {
                broadcast: { self: false, ack: false } // self: false (don't receive own packets), ack: false (fastest)
            }
        });

        this.channel
            .on('broadcast', { event: 'hand-sync' }, ({ payload }) => {
                this.onMessage(this.decompress(payload));
            })
            .subscribe((status) => {
                console.log(`[NexusSync] Room ${roomId} status: ${status}`);
            });
    }

    public leaveRoom() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
        }
    }

    /**
     * Broadcasts user landmarks with delta-compression.
     */
    public async broadcast(userId: string, roomId: string, landmarks: { x: number; y: number; z: number }[]) {
        if (!this.channel) return;

        const now = Date.now();
        // Limit to 30fps (33ms) to avoid flood
        if (now - this.lastSentAt < 30) return;

        // Delta-Check: Only send if major movement detected (> 2mm overall)
        if (!this.shouldBroadcast(landmarks)) return;

        const payload = this.compress({
            userId,
            roomId,
            landmarks,
            timestamp: now
        });

        this.channel.send({
            type: 'broadcast',
            event: 'hand-sync',
            payload
        });

        this.lastSentAt = now;
        this.lastSentLandmarks = JSON.parse(JSON.stringify(landmarks));
    }

    /**
     * Quantization (Float -> Int16) to reduce payload size by ~50%.
     */
    private compress(packet: SyncPacket) {
        return {
            u: packet.userId,
            r: packet.roomId,
            t: packet.timestamp,
            // Map 0.0-1.0 to 0-10000 range for compact transmission
            l: packet.landmarks.map(lm => [
                Math.round(lm.x * 10000),
                Math.round(lm.y * 10000),
                Math.round((lm.z || 0) * 10000)
            ])
        };
    }

    private decompress(payload: any): SyncPacket {
        return {
            userId: payload.u,
            roomId: payload.r,
            timestamp: payload.t,
            landmarks: payload.l.map((arr: number[]) => ({
                x: arr[0] / 10000,
                y: arr[1] / 10000,
                z: arr[2] / 10000
            }))
        };
    }

    private shouldBroadcast(newLm: { x: number; y: number; z: number }[]): boolean {
        if (!this.lastSentLandmarks) return true;
        
        // Sum Euclidean distances of all 21 points
        let totalDiff = 0;
        for (let i = 0; i < 21; i++) {
            const d = Math.sqrt(
                Math.pow(newLm[i].x - this.lastSentLandmarks[i].x, 2) +
                Math.pow(newLm[i].y - this.lastSentLandmarks[i].y, 2)
            );
            totalDiff += d;
        }

        // 0.05 normalized distance across 21 points is significant enough
        return totalDiff > 0.05;
    }
}
