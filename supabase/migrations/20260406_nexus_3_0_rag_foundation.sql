-- NEXUS 3.0: RAG FOUNDATION MIGRATION
-- FOCUS: Neuromuscular Patterns and Procedural Motion Fragments

-- 1. Enable pgvector (already handled in previous migrations, but good to ensure)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Neuromuscular RAG: table for EMG patterns
CREATE TABLE IF NOT EXISTS emg_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    label TEXT, -- e.g., 'tighten_grip', 'relax', 'flex'
    raw_data JSONB, -- simplified data for verification
    embedding vector(1536), -- Vector for similarity search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 3. Procedural Motion RAG: table for motion fragments (SMPL-X compatible)
CREATE TABLE IF NOT EXISTS motion_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_category TEXT, -- e.g., 'welding', 'assembly'
    fragment_type TEXT, -- e.g., 'approach', 'execution', 'retraction'
    joint_data JSONB, -- SMPL-X frames
    embedding vector(1536), -- Vector representing the motion style/intent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 4. Infrastructure Updates
ALTER TABLE companies ADD COLUMN IF NOT EXISTS blockchain_wallet TEXT;
-- Store RAG configuration per tenant
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rag_config JSONB DEFAULT '{"active": true, "model": "minimax-m2.7"}';

-- 5. Auto-Debugger Logs: Track sensor and environment issues for RAG improvement
CREATE TABLE IF NOT EXISTS debugger_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES companies(id),
    diagnostic_type TEXT, -- 'lighting', 'tracking', 'occlusion', 'glare'
    image_context_url TEXT,
    diagnostic_data JSONB,
    resolution_steps TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Vector Search (Cosine Similarity for RAG)
CREATE INDEX IF NOT EXISTS emg_patterns_embedding_idx ON emg_patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS motion_fragments_embedding_idx ON motion_fragments USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 7. RLS Policies
ALTER TABLE emg_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE motion_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debugger_logs ENABLE ROW LEVEL SECURITY;

-- EMG Patterns: User and Company Isolation
CREATE POLICY "Users can manage own EMG patterns" ON emg_patterns
FOR ALL TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Company members can view company EMG patterns" ON emg_patterns
FOR SELECT TO authenticated
USING (company_id IN (SELECT company_id FROM company_members WHERE user_id = auth.uid()));

-- Motion Fragments: Shared within company or public models
CREATE POLICY "Public read for motion fragments" ON motion_fragments
FOR SELECT TO authenticated, anon
USING (true);

-- Debugger Logs: Private to User/Admin
CREATE POLICY "Users can view own debugger logs" ON debugger_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 8. RPC Functions for RAG Retrieval
-- Search for similar Neuromuscular Patterns
CREATE OR REPLACE FUNCTION match_emg_patterns(
    query_embedding vector(1536),
    p_company_id UUID,
    match_threshold FLOAT DEFAULT 0.8,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    label TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ep.id,
        ep.label,
        1 - (ep.embedding <=> query_embedding) as similarity,
        ep.metadata
    FROM emg_patterns ep
    WHERE (ep.company_id = p_company_id OR ep.company_id IS NULL)
    AND 1 - (ep.embedding <=> query_embedding) > match_threshold
    ORDER BY ep.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
