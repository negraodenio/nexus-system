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
