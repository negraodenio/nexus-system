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
