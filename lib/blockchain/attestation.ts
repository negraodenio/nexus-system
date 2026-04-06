/**
 * NEXUS 3.0 - BLOCKCHAIN ATTESTATION SERVICE
 * Immutability layer for Physical Competence (Polygon/IPFS).
 */

import { supabase } from '../supabase';

export interface SkillAttestation {
    id: string;
    userId: string;
    skillId: string;
    skillTitle: string;
    score: number;
    timestamp: number;
    ipfsHash: string;
    transactionHash: string;
    network: 'Polygon Amoy' | 'Mainnet';
    metadata: any;
}

export class AttestationService {
    /**
     * Mints a digital competence certificate (NFT/SBT).
     * In this prototype, we simulate the Polygon/IPFS transaction.
     */
    public static async mint(
        userId: string, 
        skillId: string, 
        skillTitle: string, 
        score: number,
        landmarks: any[]
    ): Promise<SkillAttestation> {
        
        // 1. Generate Cinematic Hash (IPFS Mock)
        const cinematicData = JSON.stringify(landmarks);
        const ipfsHash = `Qm${this.pseudoHash(cinematicData)}`;

        // 2. Prepare Metadata (ERC-721 Compatible)
        const metadata = {
            name: `Nexus Mastery: ${skillTitle}`,
            description: `Universal Proof of Competence for ${skillTitle} with ${score}% alignment.`,
            image: `https://nexus.ai/api/v1/badge/${skillId}`, // Placeholder
            external_url: `https://nexus-3.verifiable/${ipfsHash}`,
            attributes: [
                { trait_type: "Skill", value: skillTitle },
                { trait_type: "Alignment Score", value: score },
                { trait_type: "Precision", value: score > 90 ? "Superior" : "Standard" },
                { trait_type: "Cinematic Protocol", value: "MediaPipe-21" }
            ]
        };

        // 3. Simulate Polygon Transaction
        const transactionHash = `0x${this.pseudoHash(userId + skillId + score)}`;
        
        const attestation: SkillAttestation = {
            id: crypto.randomUUID(),
            userId,
            skillId,
            skillTitle,
            score,
            timestamp: Date.now(),
            ipfsHash,
            transactionHash,
            network: 'Polygon Amoy',
            metadata
        };

        // 4. Persist to Supabase (Immutable Log)
        await this.saveToLedger(attestation);

        return attestation;
    }

    private static pseudoHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).padEnd(44, 'f').substring(0, 44);
    }

    private static async saveToLedger(attestation: SkillAttestation) {
        const { error } = await (supabase.from('skill_attestations') as any)
            .insert({
                id: attestation.id,
                user_id: attestation.userId,
                skill_id: attestation.skillId,
                score: attestation.score,
                ipfs_hash: attestation.ipfsHash,
                transaction_hash: attestation.transactionHash,
                metadata: attestation.metadata,
                created_at: new Date(attestation.timestamp).toISOString()
            });
        
        if (error) console.error('Ledger Error:', error);
    }
}
