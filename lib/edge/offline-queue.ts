/**
 * @fileoverview Offline Edge Queue (Resilience Runtime)
 * @description Simulates an IndexedDB/ServiceWorker queue to cache Operational Audit 
 *              Records and Risk Assessments when the device loses network connectivity.
 *              Crucial for adoption in ETARs, Substations, and Tunnels.
 */

import { NGSILDEntity, fiwareAdapter } from '../fiware/ngsi-ld-adapter';

export interface QueuedPayload {
    id: string;
    type: 'FIWARE_SYNC' | 'AUDIT_LEDGER_SYNC';
    payload: any;
    timestamp: number;
    retryCount: number;
}

export class OfflineEdgeRuntime {
    // In a real browser environment, this would be backed by IndexedDB
    private localQueue: Map<string, QueuedPayload> = new Map();
    private isOnline: boolean = true;
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startBackgroundSync();
    }

    /**
     * Toggles the network state (useful for simulations)
     */
    public setNetworkState(online: boolean) {
        this.isOnline = online;
        console.log(`[EDGE RUNTIME] Network state changed. Online: ${this.isOnline}`);
        if (this.isOnline) {
            this.forceSync();
        }
    }

    /**
     * Enqueues a payload. If online, attempts immediate dispatch.
     * If offline, caches locally.
     */
    public async enqueueFIWAREPayload(entity: NGSILDEntity): Promise<void> {
        const id = `queue_fw_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const queuedItem: QueuedPayload = {
            id,
            type: 'FIWARE_SYNC',
            payload: entity,
            timestamp: Date.now(),
            retryCount: 0
        };

        this.localQueue.set(id, queuedItem);
        console.log(`[EDGE RUNTIME] Queued FIWARE Entity: ${entity.id}`);

        if (this.isOnline) {
            await this.forceSync();
        } else {
            console.warn(`[EDGE RUNTIME] Device OFFLINE. Payload ${entity.id} securely cached in Local Storage.`);
        }
    }

    /**
     * Forces an immediate synchronization of the local queue with remote servers
     */
    public async forceSync(): Promise<void> {
        if (!this.isOnline) return;
        if (this.localQueue.size === 0) return;

        console.log(`[EDGE RUNTIME] Initiating Sync Service for ${this.localQueue.size} pending items...`);

        for (const [id, item] of this.localQueue.entries()) {
            try {
                if (item.type === 'FIWARE_SYNC') {
                    // Attempt to publish to Orion Context Broker
                    const result = await fiwareAdapter.publishToContextBroker(item.payload);
                    if (result.success) {
                        console.log(`[EDGE RUNTIME] ✅ Successfully synced ${item.payload.id} to FIWARE`);
                        this.localQueue.delete(id);
                    } else {
                        throw new Error(result.message);
                    }
                }
            } catch (error) {
                item.retryCount++;
                console.error(`[EDGE RUNTIME] ❌ Sync failed for item ${id}. Retry count: ${item.retryCount}`);
                // In production, we'd implement exponential backoff here
            }
        }
    }

    public getQueueSize(): number {
        return this.localQueue.size;
    }

    /**
     * Background worker that periodically tries to flush the queue
     */
    private startBackgroundSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        
        this.syncInterval = setInterval(() => {
            if (this.isOnline && this.localQueue.size > 0) {
                this.forceSync().catch(console.error);
            }
        }, 15000); // Try every 15 seconds
    }
}

export const offlineEdge = new OfflineEdgeRuntime();
