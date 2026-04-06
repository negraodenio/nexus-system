-- NEXUS 3.0: ECONOMY & LICENSING MIGRATION
-- FOCUS: Nexus Credits, Profit Sharing, and B2B Licensing

-- 1. Extend Profiles with Nexus Credits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance DECIMAL(12, 2) DEFAULT 1000.00; -- Initial credits for demo
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned DECIMAL(12, 2) DEFAULT 0.00;

-- 2. Extend Companies with Corporate Balance
ALTER TABLE companies ADD COLUMN IF NOT EXISTS corporate_balance DECIMAL(12, 2) DEFAULT 50000.00; 

-- 3. Extend Marketplace Listings with Licensing Meta
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS royalty_split INTEGER DEFAULT 80; -- 80% to creator
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'personal'; -- personal, b2b_batch

-- 4. Extend Transactions for Batch Licensing
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS batch_size INTEGER DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS creator_cut DECIMAL(12, 2) DEFAULT 0.00;

-- 5. Atomic Purchase Function (Simulation of Blockchain Settlement)
-- This function handles the double-entry bookkeeping for credits
CREATE OR REPLACE FUNCTION process_skill_purchase(
    p_buyer_id UUID,
    p_listing_id UUID,
    p_amount DECIMAL,
    p_batch_size INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_seller_id UUID;
    v_royalty_split INTEGER;
    v_platform_fee DECIMAL;
    v_creator_cut DECIMAL;
    v_buyer_balance DECIMAL;
BEGIN
    -- 1. Check buyer balance
    SELECT balance INTO v_buyer_balance FROM profiles WHERE id = p_buyer_id;
    IF v_buyer_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient Nexus Credits');
    END IF;

    -- 2. Get seller and royalty info
    SELECT seller_id, royalty_split INTO v_seller_id, v_royalty_split 
    FROM marketplace_listings WHERE id = p_listing_id;

    -- 3. Calculate cuts
    v_creator_cut := (p_amount * v_royalty_split) / 100;
    v_platform_fee := p_amount - v_creator_cut;

    -- 4. Atomic balance swap
    UPDATE profiles SET balance = balance - p_amount WHERE id = p_buyer_id;
    UPDATE profiles SET balance = balance + v_creator_cut, total_earned = total_earned + v_creator_cut WHERE id = v_seller_id;

    -- 5. Record transaction
    INSERT INTO transactions (listing_id, buyer_id, seller_id, amount, batch_size, platform_fee, creator_cut)
    VALUES (p_listing_id, p_buyer_id, v_seller_id, p_amount, p_batch_size, v_platform_fee, v_creator_cut);

    RETURN jsonb_build_object('success', true, 'transaction_id', lastval());
END;
$$;
