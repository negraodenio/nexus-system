-- Multi-Tenant B2B: Companies table and related structures

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    plan TEXT DEFAULT 'starter', -- starter, pro, enterprise
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company_id to existing tables
ALTER TABLE skills ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'; -- user, creator, admin, enterprise_admin

-- Company members junction table
CREATE TABLE IF NOT EXISTS company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, admin, owner
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(company_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS companies_slug_idx ON companies(slug);
CREATE INDEX IF NOT EXISTS skills_company_id_idx ON skills(company_id);
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON profiles(company_id);
CREATE INDEX IF NOT EXISTS company_members_company_id_idx ON company_members(company_id);
CREATE INDEX IF NOT EXISTS company_members_user_id_idx ON company_members(user_id);

-- RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Companies: members can view their company
CREATE POLICY "Members can view their company" ON companies
FOR SELECT TO authenticated
USING (
    id IN (
        SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
);

-- Public companies (for white-label landing pages)
CREATE POLICY "Public can view company basics" ON companies
FOR SELECT TO anon
USING (true);

-- Company members: users can see their memberships
CREATE POLICY "Users can view own memberships" ON company_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Skills: company isolation (if company_id is set, only company members can see)
CREATE POLICY "Company skills visible to members" ON skills
FOR SELECT TO authenticated
USING (
    company_id IS NULL 
    OR company_id IN (
        SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
);

-- Function to get user's company
CREATE OR REPLACE FUNCTION get_user_company(p_user_id UUID)
RETURNS TABLE (
    company_id UUID,
    company_name TEXT,
    company_slug TEXT,
    user_role TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        cm.role
    FROM companies c
    JOIN company_members cm ON cm.company_id = c.id
    WHERE cm.user_id = p_user_id
    LIMIT 1;
END;
$$;
