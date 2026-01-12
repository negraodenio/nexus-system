-- Storage RLS Policy for skill_videos bucket
-- Run this in Supabase SQL Editor

-- Allow anyone to upload videos (for testing)
INSERT INTO storage.policies (name, bucket_id, permission, definition)
SELECT 
    'Allow public uploads',
    id,
    'INSERT',
    'true'::jsonb
FROM storage.buckets WHERE name = 'skill_videos'
ON CONFLICT DO NOTHING;

-- Allow anyone to read videos
INSERT INTO storage.policies (name, bucket_id, permission, definition)
SELECT 
    'Allow public reads',
    id,
    'SELECT',
    'true'::jsonb
FROM storage.buckets WHERE name = 'skill_videos'
ON CONFLICT DO NOTHING;
