-- Add thumbnail_url to skills table
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update RLS policies if necessary (usually not needed for new columns unless specific restrictions apply)
-- Grant update access to authenticated users is usually covered by existing row-level policies.
