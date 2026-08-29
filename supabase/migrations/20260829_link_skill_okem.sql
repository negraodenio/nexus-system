-- Migration: Link Skills to OKEMs
-- Adds skill_id to okems table so each OKEM knows which skill it belongs to.
-- This enables the learning flow to retrieve the OKEM for a given skill.

ALTER TABLE okems ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES skills(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_okems_skill_id ON okems(skill_id);
