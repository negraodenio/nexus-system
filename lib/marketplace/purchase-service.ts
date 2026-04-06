/**
 * NEXUS 3.0 - PURCHASE & LICENSING SERVICE
 * Economic Engine: Managing Nexus Credits, Profit Sharing (80/20), and B2B Batch Seats.
 */

import { supabase } from '../supabase';

export interface NexusPurchaseResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export class PurchaseService {
    /**
     * Executes a single skill purchase for an individual user.
     * Triggers the atomic Profit Sharing logic in the DB.
     */
    public static async buySkill(
        userId: string, 
        listingId: string, 
        amount: number
    ): Promise<NexusPurchaseResult> {
        try {
            const { data, error } = await ((supabase as any).rpc('process_skill_purchase', {
                p_buyer_id: userId,
                p_listing_id: listingId,
                p_amount: amount,
                p_batch_size: 1
            }));

            if (error) throw error;
            return data as NexusPurchaseResult;
        } catch (err: any) {
            console.error('Purchase failed:', err);
            return { success: false, error: err.message || 'Transaction reflected a failure' };
        }
    }

    /**
     * Executes a Batch Licensing purchase for B2B Clients.
     * Licenses a skill for multiple seats at once with bulk discount.
     */
    public static async buyBatch(
        companyId: string,
        listingId: string,
        amount: number,
        batchSize: number
    ): Promise<NexusPurchaseResult> {
        try {
            // 1. Check corporate balance & apply discount (e.g., 20% off for batches > 10)
            const discount = batchSize >= 10 ? 0.8 : 1.0;
            const finalAmount = amount * batchSize * discount;

            const { data, error } = await ((supabase as any).rpc('process_skill_purchase', {
                p_buyer_id: companyId, // Can be corporate account ID
                p_listing_id: listingId,
                p_amount: finalAmount,
                p_batch_size: batchSize
            }));

            if (error) throw error;
            return data as NexusPurchaseResult;
        } catch (err: any) {
            console.error('Batch Purchase failed:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Verifies if a user has a valid license for a skill.
     * Token-Gating for Practice Mode.
     */
    public static async checkAccess(userId: string, skillId: string): Promise<boolean> {
        const listingRes: any = await supabase.from('marketplace_listings').select('id').eq('skill_id', skillId).single();
        if (!listingRes.data) return false;

        const { data, error } = await supabase
            .from('transactions')
            .select('id')
            .eq('buyer_id', userId)
            .eq('listing_id', listingRes.data.id)
            .limit(1);

        if (error || !data || data.length === 0) return false;
        return true;
    }
}
