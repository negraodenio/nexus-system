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
