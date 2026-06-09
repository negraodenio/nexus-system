/**
 * @fileoverview Immutable Audit Chain (Operational Audit Ledger)
 * @description A corporate mini-blockchain generating cryptographically linked 
 *              audit trails to prove compliance to the Tribunal de Contas and Utilities.
 */

export interface AuditRecord {
    id: string;
    procedureId: string;
    operatorId: string; // The technician who performed the action (CMD ID)
    timestamp: number;
    location?: { lat: number; lng: number };
    kinematicSignature: string; // Hash of the kinematic execution payload
    score: number;
    previousHash: string; // Link to the previous record in the ledger
    hash: string; // SHA-256 hash of all the above fields
}

export class OperationalAuditLedger {
    private ledger: AuditRecord[] = [];
    private readonly genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

    /**
     * Hashes the raw kinematic payload to create a footprint of the movement itself
     */
    public async hashKinematicData(kinematics: any): Promise<string> {
        const payloadStr = JSON.stringify(kinematics);
        return this.sha256(payloadStr);
    }

    /**
     * Appends a new formally validated execution to the immutable audit chain
     */
    public async appendRecord(
        procedureId: string,
        operatorId: string,
        score: number,
        kinematicSignature: string,
        location?: { lat: number; lng: number }
    ): Promise<AuditRecord> {
        const previousHash = this.ledger.length > 0 
            ? this.ledger[this.ledger.length - 1].hash 
            : this.genesisHash;

        const timestamp = Date.now();
        const id = `audit_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

        const recordBase = {
            id,
            procedureId,
            operatorId,
            timestamp,
            location,
            kinematicSignature,
            score,
            previousHash
        };

        const hash = await this.calculateRecordHash(recordBase);
        
        const newRecord: AuditRecord = {
            ...recordBase,
            hash
        };

        this.ledger.push(newRecord);
        return newRecord;
    }

    /**
     * Verifies the integrity of the entire chain
     * Returns true if no record has been tampered with
     */
    public async verifyChainIntegrity(): Promise<boolean> {
        for (let i = 1; i < this.ledger.length; i++) {
            const currentRecord = this.ledger[i];
            const previousRecord = this.ledger[i - 1];

            // Verify the link
            if (currentRecord.previousHash !== previousRecord.hash) {
                return false;
            }

            // Verify the hash hasn't been tampered with
            const recalculatedHash = await this.calculateRecordHash({
                id: currentRecord.id,
                procedureId: currentRecord.procedureId,
                operatorId: currentRecord.operatorId,
                timestamp: currentRecord.timestamp,
                location: currentRecord.location,
                kinematicSignature: currentRecord.kinematicSignature,
                score: currentRecord.score,
                previousHash: currentRecord.previousHash
            });

            if (currentRecord.hash !== recalculatedHash) {
                return false;
            }
        }
        return true;
    }

    public getLedger(): AuditRecord[] {
        return [...this.ledger];
    }

    private async calculateRecordHash(recordData: Omit<AuditRecord, 'hash'>): Promise<string> {
        // Deterministic serialization
        const dataString = `${recordData.id}|${recordData.procedureId}|${recordData.operatorId}|${recordData.timestamp}|${recordData.location?.lat || '0'},${recordData.location?.lng || '0'}|${recordData.kinematicSignature}|${recordData.score}|${recordData.previousHash}`;
        return this.sha256(dataString);
    }

    /**
     * Core WebCrypto SHA-256 implementation
     */
    private async sha256(message: string): Promise<string> {
        // Next.js Edge / Browser compatible WebCrypto
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
}

export const auditLedger = new OperationalAuditLedger();
