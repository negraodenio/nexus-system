-- Add duration_minutes to skills table
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
