-- NEXUS MOTION 3.0 GENESIS BOOTSTRAP
-- RESET PUBLIC SCHEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- FILE: supabase/migrations/profiles_auth.sql
-- Profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    company_id UUID, -- For B2B: which company they belong to
    role TEXT DEFAULT 'user', -- user, creator, admin, enterprise_admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
;

-- FILE: supabase/migrations/20251231_physical_graph.sql
-- 1. Tabela de Habilidades (Skills)
-- Armazena o metadado da habilidade (título, autor, dificuldade)
create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid default auth.uid(), -- Vincula ao usuário logado
  title text not null,
  category text,
  difficulty_level int check (difficulty_level between 1 and 5),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Tabela de Frames (Skill Frames)
-- Armazena os dados brutos de movimento (JSON) para cada frame do vídeo
create table if not exists skill_frames (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references skills(id) on delete cascade,
  frame_index int not null,
  landmarks jsonb not null, -- Dados do MediaPipe (x, y, z)
  tool_position jsonb, -- Dados adicionais (ex: bounding box da ferramenta)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices e Políticas de Segurança (Row Level Security - RLS)

-- Habilitar RLS
alter table skills enable row level security;
alter table skill_frames enable row level security;

-- Index para performance na reprodução
create index if not exists idx_skill_frames_skill_id on skill_frames(skill_id);
create index if not exists idx_skill_frames_order on skill_frames(skill_id, frame_index);

-- Políticas (Simplificadas para MVP)
-- Todo mundo pode ler (para reproduzir)
create policy "Skills are public" on skills for select using (true);
create policy "Frames are public" on skill_frames for select using (true);

-- Apenas autenticados podem criar
create policy "Users can create skills" on skills for insert with check (auth.role() = 'authenticated');
create policy "Users can create frames" on skill_frames for insert with check (auth.role() = 'authenticated');
;

-- FILE: supabase/migrations/20260101_analytics.sql
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
;

-- FILE: supabase/migrations/20260101_companies_b2b.sql
-- Multi-Tenant B2B: Companies table and related structures

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    plan TEXT DEFAULT 'starter', -- starter, pro, enterprise
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company_id to existing tables
ALTER TABLE skills ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'; -- user, creator, admin, enterprise_admin

-- Company members junction table
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, admin, owner
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(company_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS companies_slug_idx ON companies(slug);
CREATE INDEX IF NOT EXISTS skills_company_id_idx ON skills(company_id);
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON profiles(company_id);
CREATE INDEX IF NOT EXISTS company_members_company_id_idx ON company_members(company_id);
CREATE INDEX IF NOT EXISTS company_members_user_id_idx ON company_members(user_id);

-- RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Companies: members can view their company
CREATE POLICY "Members can view their company" ON companies
FOR SELECT TO authenticated
USING (
    id IN (
        SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
);

-- Public companies (for white-label landing pages)
CREATE POLICY "Public can view company basics" ON companies
FOR SELECT TO anon
USING (true);

-- Company members: users can see their memberships
CREATE POLICY "Users can view own memberships" ON company_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Skills: company isolation (if company_id is set, only company members can see)
CREATE POLICY "Company skills visible to members" ON skills
FOR SELECT TO authenticated
USING (
    company_id IS NULL 
    OR company_id IN (
        SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
);

-- Function to get user's company
CREATE OR REPLACE FUNCTION get_user_company(p_user_id UUID)
RETURNS TABLE (
    company_id UUID,
    company_name TEXT,
    company_slug TEXT,
    user_role TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        cm.role
    FROM companies c
    JOIN company_members cm ON cm.company_id = c.id
    WHERE cm.user_id = p_user_id
    LIMIT 1;
END;
$$;
;

-- FILE: supabase/migrations/20260101_marketplace.sql
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
;

-- FILE: supabase/migrations/20260101_skill_embeddings.sql
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
;

-- FILE: supabase/migrations/20260102_sop_instructions.sql
-- Add instructions column to skills table
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Comment on column
COMMENT ON COLUMN skills.instructions IS 'Text content of the Standard Operating Procedure (POP/SOP) for this skill';
;

-- FILE: supabase/migrations/20260103_add_missing_columns.sql
-- Add missing columns to skills table
-- These columns are referenced in the code but not in the original schema

ALTER TABLE skills ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS description TEXT;

-- Update RLS policy to allow users to update their own skills (for video_url)
DROP POLICY IF EXISTS "Users can update own skills" ON skills;
CREATE POLICY "Users can update own skills" ON skills
    FOR UPDATE 
    USING (creator_id = auth.uid())
    WITH CHECK (creator_id = auth.uid());

-- Add comment for documentation
COMMENT ON COLUMN skills.video_url IS 'URL of the skill demonstration video stored in Supabase Storage';
COMMENT ON COLUMN skills.description IS 'Optional description of the skill';
;

-- FILE: supabase/migrations/20260108163500_add_thumbnail_column.sql
-- Add thumbnail_url to skills table
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update RLS policies if necessary (usually not needed for new columns unless specific restrictions apply)
-- Grant update access to authenticated users is usually covered by existing row-level policies.
;

-- FILE: supabase/migrations/20260108164000_add_duration_column.sql
-- Add duration_minutes to skills table
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
;

-- FILE: supabase/migrations/20260108164500_finish_meo_schema.sql
-- Final Schema Consolidation for MEO Demo
-- Adds all remaining columns and ensures type safety.

-- 1. Add verification_status (Missing in previous steps)
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- 2. Add skeleton_data as JSONB (Simulated column for simplified seed, real app uses skill_frames)
-- Alternatively, we can migrate seed data to skill_frames, but for the demo script simplicity,
-- we will allow a 'snapshot' of skeleton data in the main table for quick loading.
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS skeleton_data JSONB DEFAULT '[]'::jsonb;

-- 3. Ensure tags exists (It should, but safety first)
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 4. Add Indexes for JSONB columns if they don't exist (Performance)
CREATE INDEX IF NOT EXISTS idx_skills_skeleton_gin ON public.skills USING GIN (skeleton_data);

-- 5. Grant permissions if needed (usually auto-inherited)
-- GRANT ALL ON public.skills TO service_role;
;

-- FILE: supabase/migrations/20260108170000_seed_meo_demo.sql
-- Seed Data for MEO Demo
-- This script populates the database with the "Happy Path" skills for the presentation.

INSERT INTO public.skills (
    title, 
    description, 
    video_url, 
    thumbnail_url, 
    difficulty_level, 
    duration_minutes, 
    category, 
    tags, 
    verification_status,
    instructions,
    skeleton_data
) VALUES 
(
    'Diagnóstico LOS FiberGateway GR241GE', -- Title
    'Procedimento padrão para diagnóstico de falha de sinal óptico (Lose of Signal) em routers FiberGateway. Inclui verificação de patch cord e potenciais dobras.', -- Description
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', -- Placeholder Video
    '/nexus_meo_router_diagnostic_1767873857942.png', -- Thumbnail (From our assets!)
    1, -- difficulty_level (1=Beginner)
    5,
    'Technical Support',
    ARRAY['MEO', 'FiberGateway', 'LOS', 'CPE', 'Diagnostico', 'Router'],
    'verified',
    '[
        {"time": 0, "text": "Verifique se o LED PON está a piscar vermelho."},
        {"time": 5, "text": "Inspecione o patch cord amarelo para ver se há dobras excessivas (raio < 3cm)."},
        {"time": 15, "text": "Desconecte e limpe o conector APC (verde) com a caneta de limpeza."},
        {"time": 30, "text": "Reinicie o equipamento e aguarda a sincronização."}
    ]'::jsonb,
    '[]'::jsonb -- Empty skeleton for this one (AR Text focus)
),
(
    'Fusão Óptica Padrão MEO', -- Title
    'Passo a passo para realização de fusão em fibra monomodo G.657.A2 utilizando máquina de fusão Fujikura.', -- Description
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', -- Placeholder video
    'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=1000&auto=format&fit=crop', -- Thumbnail
    5, -- difficulty_level (5=Expert)
    15,
    'Field Operations',
    ARRAY['MEO', 'Fibra', 'FTTH', 'Fusão', 'Treinamento', 'Optical'],
    'verified',
    '[
        {"time": 0, "text": "Decape 3cm da fibra utilizando o alicate de precisão."},
        {"time": 10, "text": "Limpe a fibra com álcool isopropílico."},
        {"time": 20, "text": "Realize o corte (clivagem) garantindo ângulo < 0.5 graus."},
        {"time": 40, "text": "Posicione na máquina de fusão e feche a tampa."}
    ]'::jsonb,
    '[{"frame":0, "landmarks": []}]'::jsonb -- Mock skeleton
);
;

-- FILE: supabase/migrations/20260112_security_hardening.sql
-- =============================================================================
-- SECURITY HARDENING MIGRATION - POST-POC PHASE 1
-- =============================================================================
-- This migration implements:
-- 1. Proper RLS policies based on auth.uid()
-- 2. Audit logging table for compliance
-- 3. Soft delete (deleted_at) for GDPR compliance
-- 4. Atomic transaction RPC for skill saving
-- =============================================================================

-- =============================================================================
-- PART 1: ADD SOFT DELETE COLUMNS
-- =============================================================================

-- Add deleted_at to skills
ALTER TABLE skills ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add deleted_at to skill_frames
ALTER TABLE skill_frames ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_at to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_skills_deleted_at ON skills(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_skill_frames_deleted_at ON skill_frames(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- PART 2: AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS on audit logs (only admins can read)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON audit_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- PART 3: AUDIT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if this is a soft delete
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
            INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
            VALUES (TG_TABLE_NAME, NEW.id, 'SOFT_DELETE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        ELSE
            INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
            VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to main tables
DROP TRIGGER IF EXISTS audit_skills ON skills;
CREATE TRIGGER audit_skills
    AFTER INSERT OR UPDATE OR DELETE ON skills
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_skill_frames ON skill_frames;
CREATE TRIGGER audit_skill_frames
    AFTER INSERT OR UPDATE OR DELETE ON skill_frames
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- =============================================================================
-- PART 4: DROP INSECURE RLS POLICIES
-- =============================================================================

-- Skills table
DROP POLICY IF EXISTS "Enable insert for anon" ON skills;
DROP POLICY IF EXISTS "Allow anon to update skills" ON skills;
DROP POLICY IF EXISTS "Allow authenticated to update skills" ON skills;
DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
DROP POLICY IF EXISTS "Anyone can read skills" ON skills;

-- Skill frames table
DROP POLICY IF EXISTS "Enable insert for anon" ON skill_frames;
DROP POLICY IF EXISTS "Anyone can view skill_frames" ON skill_frames;
DROP POLICY IF EXISTS "Anyone can read skill_frames" ON skill_frames;

-- =============================================================================
-- PART 5: CREATE SECURE RLS POLICIES
-- =============================================================================

-- Ensure RLS is enabled
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_frames ENABLE ROW LEVEL SECURITY;

-- Drop first to avoid conflicts (idempotent migration)
DROP POLICY IF EXISTS "Public skills are viewable by anyone" ON skills;
DROP POLICY IF EXISTS "Authenticated users can create skills" ON skills;
DROP POLICY IF EXISTS "Users can update own skills" ON skills;
DROP POLICY IF EXISTS "Users can soft delete own skills" ON skills;
DROP POLICY IF EXISTS "Users can view frames of accessible skills" ON skill_frames;
DROP POLICY IF EXISTS "Authenticated users can create frames for own skills" ON skill_frames;
DROP POLICY IF EXISTS "Users can update frames of own skills" ON skill_frames;

-- SKILLS: Read policies
CREATE POLICY "Public skills are viewable by anyone"
    ON skills FOR SELECT
    USING (
        deleted_at IS NULL 
        AND (
            is_public = true 
            OR creator_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'enterprise_admin')
            )
        )
    );

-- SKILLS: Insert policies (authenticated users only)
CREATE POLICY "Authenticated users can create skills"
    ON skills FOR INSERT
    TO authenticated
    WITH CHECK (creator_id = auth.uid());

-- SKILLS: Update policies (owner only)
CREATE POLICY "Users can update own skills"
    ON skills FOR UPDATE
    TO authenticated
    USING (creator_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (creator_id = auth.uid());

-- SKILLS: Delete policies (soft delete via update, no hard delete)
CREATE POLICY "Users can soft delete own skills"
    ON skills FOR DELETE
    TO authenticated
    USING (creator_id = auth.uid());

-- SKILL_FRAMES: Read policies
CREATE POLICY "Users can view frames of accessible skills"
    ON skill_frames FOR SELECT
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM skills 
            WHERE skills.id = skill_frames.skill_id 
            AND (
                skills.is_public = true 
                OR skills.creator_id = auth.uid()
            )
        )
    );

-- SKILL_FRAMES: Insert policies
CREATE POLICY "Authenticated users can create frames for own skills"
    ON skill_frames FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM skills 
            WHERE skills.id = skill_frames.skill_id 
            AND skills.creator_id = auth.uid()
        )
    );

-- SKILL_FRAMES: Update policies
CREATE POLICY "Users can update frames of own skills"
    ON skill_frames FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM skills 
            WHERE skills.id = skill_frames.skill_id 
            AND skills.creator_id = auth.uid()
        )
    );


-- =============================================================================
-- PART 6: ATOMIC SAVE RPC
-- =============================================================================

CREATE OR REPLACE FUNCTION save_skill_atomic(
    p_skill_id UUID,
    p_skill_name TEXT,
    p_skill_description TEXT DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT false,
    p_video_url TEXT DEFAULT NULL,
    p_thumbnail_url TEXT DEFAULT NULL,
    p_frames JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_skill_id UUID;
    v_frame JSONB;
    v_frame_index INT := 0;
BEGIN
    -- Validate user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Insert or update skill
    INSERT INTO skills (
        id, 
        name, 
        description, 
        is_public, 
        video_url, 
        thumbnail_url, 
        creator_id,
        created_at,
        updated_at
    )
    VALUES (
        COALESCE(p_skill_id, gen_random_uuid()),
        p_skill_name,
        p_skill_description,
        p_is_public,
        p_video_url,
        p_thumbnail_url,
        auth.uid(),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_public = EXCLUDED.is_public,
        video_url = EXCLUDED.video_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        updated_at = NOW()
    WHERE skills.creator_id = auth.uid()
    RETURNING id INTO v_skill_id;

    -- If skill wasn't returned, user doesn't own it
    IF v_skill_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Cannot modify skill you do not own';
    END IF;

    -- Delete existing frames (will be replaced)
    DELETE FROM skill_frames WHERE skill_id = v_skill_id;

    -- Insert new frames
    FOR v_frame IN SELECT * FROM jsonb_array_elements(p_frames)
    LOOP
        INSERT INTO skill_frames (
            skill_id,
            frame_index,
            landmarks,
            timestamp_ms,
            created_at
        )
        VALUES (
            v_skill_id,
            v_frame_index,
            v_frame->'landmarks',
            COALESCE((v_frame->>'timestamp_ms')::INT, v_frame_index * 33),
            NOW()
        );
        v_frame_index := v_frame_index + 1;
    END LOOP;

    RETURN v_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION save_skill_atomic TO authenticated;

-- =============================================================================
-- PART 7: GDPR RIGHT TO FORGET
-- =============================================================================

CREATE OR REPLACE FUNCTION gdpr_delete_user_data(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_deleted_skills INT := 0;
    v_deleted_frames INT := 0;
    v_deleted_profile BOOLEAN := false;
BEGIN
    -- Use provided user_id or current user
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Only allow users to delete own data (unless admin)
    IF v_user_id != auth.uid() THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'enterprise_admin')
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Cannot delete other user data';
        END IF;
    END IF;

    -- Soft delete all user's skill frames
    UPDATE skill_frames sf
    SET deleted_at = NOW()
    FROM skills s
    WHERE sf.skill_id = s.id 
    AND s.creator_id = v_user_id
    AND sf.deleted_at IS NULL;
    
    GET DIAGNOSTICS v_deleted_frames = ROW_COUNT;

    -- Soft delete all user's skills
    UPDATE skills
    SET deleted_at = NOW()
    WHERE creator_id = v_user_id
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS v_deleted_skills = ROW_COUNT;

    -- Anonymize profile (keep for referential integrity)
    UPDATE profiles
    SET 
        email = 'deleted_' || id::TEXT,
        display_name = 'Deleted User',
        avatar_url = NULL,
        deleted_at = NOW()
    WHERE id = v_user_id
    AND deleted_at IS NULL;
    
    v_deleted_profile := FOUND;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'deleted_skills', v_deleted_skills,
        'deleted_frames', v_deleted_frames,
        'profile_anonymized', v_deleted_profile
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION gdpr_delete_user_data TO authenticated;

-- =============================================================================
-- PART 8: SERVICE ROLE BYPASS FOR DEMO/SEEDING
-- =============================================================================
-- Note: Service role always bypasses RLS. This is for edge functions and admin.

-- Create a policy for service role to manage all skills (for seeding/admin)
CREATE POLICY "Service role has full access to skills"
    ON skills FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to skill_frames"
    ON skill_frames FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration
INSERT INTO audit_logs (table_name, record_id, action, new_data)
VALUES (
    '_migrations', 
    gen_random_uuid(), 
    'INSERT', 
    jsonb_build_object(
        'name', '20260112_security_hardening',
        'description', 'RLS policies, audit logging, soft delete, GDPR functions',
        'applied_at', NOW()
    )
);
;

-- FILE: supabase/migrations/20260406_nexus_3_0_blockchain_attestation.sql
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
;

-- FILE: supabase/migrations/20260406_nexus_3_0_economy.sql
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
;

-- FILE: supabase/migrations/20260406_nexus_3_0_rag_foundation.sql
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
;

-- FILE: supabase/migrations/add_skill_search.sql
-- Migration: Add searchable metadata to skills table
-- Run this in Supabase SQL Editor

-- Add new columns for search functionality
ALTER TABLE skills ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE skills ADD COLUMN IF NOT EXISTS description text;

-- Add full-text search vector (auto-generated from title + description)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING GIN(tags);

-- That's it! No policy changes needed - they already exist.
;

-- FILE: supabase/migrations/fix_auth_trigger.sql
-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    company_id UUID,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Robust Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
        
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure policies exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable'
    ) THEN
        CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
    END IF;
END
$$;
;

-- FILE: supabase/migrations/fix_rls_anon.sql
-- Allow anonymous users to INSERT into skills and skill_frames for testing purposes
-- Run this in your Supabase SQL Editor

-- 1. Policies for 'skills'
CREATE POLICY "Enable insert for anon" ON "public"."skills"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);

-- 2. Policies for 'skill_frames'
CREATE POLICY "Enable insert for anon" ON "public"."skill_frames"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);
;

-- FILE: supabase/migrations/fix_skills_update_rls.sql
-- Fix RLS policies for skills table to allow video_url updates

-- Allow anyone to update skills (for anonymous recording)
CREATE POLICY "Allow anon to update skills" ON skills
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Allow authenticated users to update skills
CREATE POLICY "Allow authenticated to update skills" ON skills
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- If policies already exist, drop and recreate:
-- DROP POLICY IF EXISTS "Allow anon to update skills" ON skills;
-- DROP POLICY IF EXISTS "Allow authenticated to update skills" ON skills;
;

-- FILE: supabase/migrations/seed_meo_demo.sql

;

-- FILE: supabase/migrations/storage_rls_video.sql
-- Storage RLS Policy for skill-videos bucket
-- Sintaxe moderna do Supabase (2024+)
-- PASSO 1: Criar o bucket manualmente em Storage > Buckets > New Bucket
--          Nome: skill-videos | Public: true
-- PASSO 2: Correr este SQL

-- Upload público (utilizadores autenticados e anónimos)
CREATE POLICY "Allow public uploads to skill-videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'skill-videos');

-- Leitura pública
CREATE POLICY "Allow public reads from skill-videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'skill-videos');

-- Update só pelo dono
CREATE POLICY "Allow owner update in skill-videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- Delete só pelo dono
CREATE POLICY "Allow owner delete from skill-videos"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
;

