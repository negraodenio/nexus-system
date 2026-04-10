-- =============================================================================
-- NEXUS IRON SHIELD: ENTERPRISE SECURITY & MULTI-TENANCY
-- =============================================================================

-- 1. ESTRUTURA BASE DE TENANTS (GARANTIA)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    UNIQUE(company_id, user_id)
);

-- 2. ADIÇÃO DE COMPANY_ID (MULTITENANCY TRANSFORMATION)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.skill_embeddings ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Criar tabela de telemetria se não existir (Audit Trail)
CREATE TABLE IF NOT EXISTS public.field_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    session_id TEXT NOT NULL,
    tech_id TEXT NOT NULL,
    module_id TEXT,
    step_index INT,
    score FLOAT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LIMPEZA DE POLÍTICAS PERMISSIVAS (PURGE)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Skills are public" ON public.skills;
DROP POLICY IF EXISTS "Frames are public" ON public.skill_frames;
DROP POLICY IF EXISTS "Allow public read on skill_embeddings" ON public.skill_embeddings;
DROP POLICY IF EXISTS "Allow insert on skill_embeddings" ON public.skill_embeddings;

-- 4. IMPLEMENTAÇÃO DE RLS MULTI-TENANT (IRON SHIELD)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_telemetry ENABLE ROW LEVEL SECURITY;

-- Helper Function para isolamento
CREATE OR REPLACE FUNCTION public.current_user_companies()
RETURNS SETOF UUID AS $$
    SELECT company_id FROM public.company_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas Globais
CREATE POLICY "Iron Shield: Multi-tenant Profiles" ON public.profiles
    FOR SELECT USING (company_id IN (SELECT public.current_user_companies()));

CREATE POLICY "Iron Shield: Multi-tenant Skills" ON public.skills
    FOR SELECT USING (company_id IN (SELECT public.current_user_companies()) OR is_public = true);

CREATE POLICY "Iron Shield: Multi-tenant Telemetry" ON public.field_telemetry
    FOR ALL USING (company_id IN (SELECT public.current_user_companies()));

CREATE POLICY "Iron Shield: Multi-tenant Embeddings" ON public.skill_embeddings
    FOR SELECT USING (company_id IN (SELECT public.current_user_companies()));

-- 5. UPGRADE RAG: IVFFLAT -> HNSW (PRO PERFORMANCE)
DROP INDEX IF EXISTS public.skill_embeddings_vector_idx;
CREATE INDEX IF NOT EXISTS skill_embeddings_hnsw_idx 
ON public.skill_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 6. COMPLIANCE: TTL (24H DATA RETENTION)
-- Limpeza automática de telemetria para cumprir política de "Não Retenção"
CREATE OR REPLACE FUNCTION public.cleanup_expired_telemetry()
RETURNS void AS $$
BEGIN
    DELETE FROM public.field_telemetry
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: Requer agendador (pg_cron) ou trigger de manutenção.
-- Para efeitos de demo, executamos agora e deixamos a função disponível.
SELECT public.cleanup_expired_telemetry();
