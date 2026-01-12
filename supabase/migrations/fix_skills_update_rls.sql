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
