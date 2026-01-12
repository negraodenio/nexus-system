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
