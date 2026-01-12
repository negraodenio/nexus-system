-- Analytics tables for tracking skill views and learning progress

-- Track skill views
CREATE TABLE IF NOT EXISTS skill_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT, -- For anonymous tracking
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE
);

-- Track learning progress per user per skill
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    practice_count INT DEFAULT 0,
    best_alignment_score INT DEFAULT 0,
    total_practice_time_seconds INT DEFAULT 0,
    last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS skill_views_skill_id_idx ON skill_views(skill_id);
CREATE INDEX IF NOT EXISTS skill_views_viewed_at_idx ON skill_views(viewed_at);
CREATE INDEX IF NOT EXISTS learning_progress_user_id_idx ON learning_progress(user_id);

-- RLS policies
ALTER TABLE skill_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for anonymous tracking)
CREATE POLICY "Allow insert skill_views" ON skill_views
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Users can see their own learning progress
CREATE POLICY "Allow select own learning_progress" ON learning_progress
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own learning_progress" ON learning_progress
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update own learning_progress" ON learning_progress
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Aggregate views for analytics (function)
CREATE OR REPLACE FUNCTION get_skill_analytics(p_skill_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_viewers BIGINT,
    avg_duration FLOAT,
    completion_rate FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_views,
        COUNT(DISTINCT COALESCE(user_id::TEXT, session_id))::BIGINT as unique_viewers,
        AVG(duration_seconds)::FLOAT as avg_duration,
        (SUM(CASE WHEN completed THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0))::FLOAT as completion_rate
    FROM skill_views
    WHERE skill_id = p_skill_id;
END;
$$;

-- Get trending skills (most viewed in last 7 days)
CREATE OR REPLACE FUNCTION get_trending_skills(limit_count INT DEFAULT 10)
RETURNS TABLE (
    skill_id UUID,
    title TEXT,
    view_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.skill_id,
        s.title,
        COUNT(*)::BIGINT as view_count
    FROM skill_views sv
    JOIN skills s ON s.id = sv.skill_id
    WHERE sv.viewed_at > NOW() - INTERVAL '7 days'
    GROUP BY sv.skill_id, s.title
    ORDER BY view_count DESC
    LIMIT limit_count;
END;
$$;
