-- Create Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'active', -- active, sold, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associate listing with skill (Unique constraint to prevent duplicate listings)
CREATE UNIQUE INDEX idx_marketplace_skill ON marketplace_listings(skill_id) WHERE status = 'active';

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Listings
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Everyone can view active listings
CREATE POLICY "Public view active listings" ON marketplace_listings
    FOR SELECT USING (status = 'active');

-- Sellers can manage their own listings
CREATE POLICY "Users can insert own listings" ON marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own listings" ON marketplace_listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own listings" ON marketplace_listings
    FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view transactions involves them
CREATE POLICY "Users view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Only system/server actions should likely insert transactions, 
-- but for MVP allowing authenticated users to insert (simulated buy)
CREATE POLICY "Users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Function to handle purchase (Atomic Transaction recommended in real app, keeping simple for MVP)
-- OR just rely on client-side insert for MVP prototype.
