-- Migration: Create OKEMs table
-- This migration creates the necessary tables for storing OKEMs

-- Create OKEMs table
CREATE TABLE IF NOT EXISTS okems (
    id TEXT PRIMARY KEY,
    procedure_name TEXT NOT NULL,
    specialist_id TEXT NOT NULL,
    niche_id TEXT,
    language TEXT NOT NULL DEFAULT 'pt',
    total_duration_ms INTEGER NOT NULL DEFAULT 0,
    step_count INTEGER NOT NULL DEFAULT 0,
    confidence REAL NOT NULL DEFAULT 0,
    warnings TEXT[] DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    guidance JSONB NOT NULL DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_okems_specialist_id ON okems(specialist_id);
CREATE INDEX IF NOT EXISTS idx_okems_niche_id ON okems(niche_id);
CREATE INDEX IF NOT EXISTS idx_okems_created_at ON okems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_okems_procedure_name ON okems(procedure_name);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_okems_search ON okems USING gin(to_tsvector('portuguese', procedure_name));

-- Create learning_sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
    id TEXT PRIMARY KEY,
    okem_id TEXT NOT NULL REFERENCES okems(id) ON DELETE CASCADE,
    learner_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    overall_score REAL DEFAULT 0,
    step_scores JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for learning_sessions
CREATE INDEX IF NOT EXISTS idx_learning_sessions_okem_id ON learning_sessions(okem_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_learner_id ON learning_sessions(learner_id);

-- Create analytics table
CREATE TABLE IF NOT EXISTS okem_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    okem_id TEXT NOT NULL REFERENCES okems(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_okem_analytics_okem_id ON okem_analytics(okem_id);
CREATE INDEX IF NOT EXISTS idx_okem_analytics_event_type ON okem_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_okem_analytics_created_at ON okem_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE okems ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE okem_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own OKEMs" ON okems
    FOR SELECT USING (auth.uid()::text = specialist_id);

CREATE POLICY "Users can insert their own OKEMs" ON okems
    FOR INSERT WITH CHECK (auth.uid()::text = specialist_id);

CREATE POLICY "Users can update their own OKEMs" ON okems
    FOR UPDATE USING (auth.uid()::text = specialist_id);

CREATE POLICY "Users can delete their own OKEMs" ON okems
    FOR DELETE USING (auth.uid()::text = specialist_id);

CREATE POLICY "Users can view their own learning sessions" ON learning_sessions
    FOR SELECT USING (auth.uid()::text = learner_id);

CREATE POLICY "Users can insert their own learning sessions" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = learner_id);

CREATE POLICY "Users can view analytics for their OKEMs" ON okem_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM okems
            WHERE okems.id = okem_analytics.okem_id
            AND okems.specialist_id = auth.uid()::text
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_okems_updated_at
    BEFORE UPDATE ON okems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for OKEM statistics
CREATE OR REPLACE VIEW okem_stats AS
SELECT
    COUNT(*) as total_okems,
    COUNT(DISTINCT specialist_id) as total_specialists,
    COUNT(DISTINCT niche_id) as total_niches,
    AVG(confidence) as avg_confidence,
    AVG(step_count) as avg_steps
FROM okems;

-- Create view for popular procedures
CREATE OR REPLACE VIEW popular_procedures AS
SELECT
    okem_id,
    COUNT(*) as session_count,
    AVG(overall_score) as avg_score
FROM learning_sessions
WHERE completed_at IS NOT NULL
GROUP BY okem_id
ORDER BY session_count DESC;
