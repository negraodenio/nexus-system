-- =============================================================================
-- NEXUS IRON SHIELD V2: ADVANCED ENTERPRISE HARDENING
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ESTRUTURA BASE & TENANTS (GARANTIA)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. MIGRAÇÃO DE 3 ETAPAS PARA COMPANY_ID (SAFE PATTERN)
-- -----------------------------------------------------------------------------

-- STEP 1: Adicionar Nullable Columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- STEP 2: Backfill (Popula com base nos dados existentes para não quebrar a demo)
-- Primeiro criamos uma empresa default se não houver nenhuma
INSERT INTO public.companies (name, slug) 
VALUES ('Nexus Global Ops', 'nexus-global')
ON CONFLICT (slug) DO NOTHING;

-- Associar usuários órfãos à empresa default (Demo User)
INSERT INTO public.company_members (company_id, user_id, role)
SELECT c.id, p.id, 'owner'
FROM public.profiles p, public.companies c
WHERE c.slug = 'nexus-global'
AND p.id NOT IN (SELECT user_id FROM public.company_members)
ON CONFLICT DO NOTHING;

-- Executar o Backfill propriamente dito
UPDATE public.profiles p
SET company_id = cm.company_id
FROM public.company_members cm
WHERE cm.user_id = p.id
AND p.company_id IS NULL;

UPDATE public.skills s
SET company_id = c.id
FROM public.companies c
WHERE c.slug = 'nexus-global'
AND s.company_id IS NULL;

-- STEP 3: Enforce Constraints (Production Ready)
-- Nota: Só habilitar NOT NULL quando o backfill estiver 100% validado
-- ALTER TABLE public.profiles ALTER COLUMN company_id SET NOT NULL;
-- ALTER TABLE public.skills ALTER COLUMN company_id SET NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. UPGRADE RAG: HNSW TUNING (SENIOR RECALL)
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS public.skill_embeddings_hnsw_idx;
CREATE INDEX IF NOT EXISTS skill_embeddings_hnsw_v2_idx 
ON public.skill_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 128);

-- -----------------------------------------------------------------------------
-- 4. TTL 2-LAYER (HOT/COLD COMPLIANCE)
-- -----------------------------------------------------------------------------

-- Tabela COLD para agregados (Sem PII - GDPR Compliant)
CREATE TABLE IF NOT EXISTS public.telemetry_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    module_id TEXT,
    avg_score FLOAT,
    error_rate FLOAT,
    session_count INT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION public.archive_telemetry_to_cold_layer()
RETURNS void AS $$
BEGIN
    -- Agrega os dados das últimas 24h antes de apagar
    INSERT INTO public.telemetry_aggregates (company_id, module_id, avg_score, error_rate, session_count, period_start, period_end)
    SELECT 
        company_id, 
        module_id, 
        AVG(score) as avg_score,
        COUNT(CASE WHEN score < 40 THEN 1 END)::FLOAT / COUNT(*)::FLOAT as error_rate,
        COUNT(DISTINCT session_id) as session_count,
        NOW() - INTERVAL '24 hours',
        NOW()
    FROM public.field_telemetry
    WHERE created_at < NOW() - INTERVAL '24 hours'
    GROUP BY company_id, module_id;

    -- HOT LAYER PURGE (24h Retention)
    DELETE FROM public.field_telemetry
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 5. RATE LIMITING (ANTI-SPAM)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    key TEXT PRIMARY KEY, -- user_id or IP
    hits INT DEFAULT 1,
    last_hit TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- RLS HARDENING (FINAL SHIELD)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_telemetry ENABLE ROW LEVEL SECURITY;

-- Helper Function para isolamento (Habilitada no Runtime)
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.company_members 
        WHERE user_id = auth.uid() 
        AND company_id = p_company_id
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Política Iron Shield v2
CREATE POLICY "Iron Shield v2: Absolute Multi-tenant" ON public.field_telemetry
    FOR ALL USING (public.is_company_member(company_id));

-- Runtime Configuration for HNSW
-- SET hnsw.ef_search = 64; 
