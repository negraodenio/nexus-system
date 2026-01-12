-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add description and tags to skills if not exists
ALTER TABLE skills ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create skill_embeddings table for semantic search
CREATE TABLE IF NOT EXISTS skill_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI ada-002 dimension
    content TEXT, -- The text that was embedded
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(skill_id)
);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS skill_embeddings_vector_idx 
ON skill_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RLS policies
ALTER TABLE skill_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on skill_embeddings" ON skill_embeddings
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert on skill_embeddings" ON skill_embeddings
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Function to search skills by semantic similarity
CREATE OR REPLACE FUNCTION search_skills_semantic(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    skill_id UUID,
    title TEXT,
    description TEXT,
    video_url TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as skill_id,
        s.title,
        s.description,
        s.video_url,
        1 - (se.embedding <=> query_embedding) as similarity
    FROM skill_embeddings se
    JOIN skills s ON s.id = se.skill_id
    WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
    ORDER BY se.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
