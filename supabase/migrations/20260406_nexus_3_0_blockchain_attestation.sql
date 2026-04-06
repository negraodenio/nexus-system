-- NEXUS 3.0: BLOCKCHAIN ATTESTATION MIGRATION
-- FOCUS: Physical Competence Ledger and Universal Proof of Mastery

-- 1. Create Skill Attestations Table (The Immutable Ledger)
CREATE TABLE IF NOT EXISTS skill_attestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    ipfs_hash TEXT NOT NULL, -- The CINEMATIC CID
    transaction_hash TEXT NOT NULL UNIQUE, -- The Polygon TX Hash
    network TEXT DEFAULT 'Polygon Amoy',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexing for fast retrieval and verification
CREATE INDEX IF NOT EXISTS skill_attestations_user_idx ON skill_attestations(user_id);
CREATE INDEX IF NOT EXISTS skill_attestations_skill_idx ON skill_attestations(skill_id);

-- 3. RLS Policies
ALTER TABLE skill_attestations ENABLE ROW LEVEL SECURITY;

-- Everyone can verify/read attestations (Public Transparency)
CREATE POLICY "Public read for attestations" ON skill_attestations
FOR SELECT TO authenticated, anon
USING (true);

-- Only authenticated users can 'mint' (insert) their own accomplishments
CREATE POLICY "Users can insert own attestations" ON skill_attestations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Attestations are IMMUTABLE: No UPDATE or DELETE allowed by policy
CREATE POLICY "Attestations are immutable - no update" ON skill_attestations
FOR UPDATE USING (false);

CREATE POLICY "Attestations are immutable - no delete" ON skill_attestations
FOR DELETE USING (false);

-- 4. Audit Log for High-Authority Verification
CREATE TABLE IF NOT EXISTS certificate_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attestation_id UUID REFERENCES skill_attestations(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('verified', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certificate_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifiers can insert logs" ON certificate_verifications
FOR INSERT TO authenticated
WITH CHECK (true);
