-- Migration: Additive learner READ policy for OKEMs linked to public Skills
-- Date:    2026-08-31
-- Scope:   R3 — learner access
--
-- What it does:
--   Adds a SELECT policy so a learner can read an OKEM when:
--     1. The learner is the OKEM's specialist (owner) — preserved from
--        the existing "Users can view their own OKEMs" policy, OR
--     2. The OKEM's skill_id references a Skill where is_public = true.
--
-- What it does NOT do:
--   - It does NOT weaken INSERT / UPDATE / DELETE ownership. Those remain
--     restricted to auth.uid() == specialist_id (see 20240101000000_create_okems.sql).
--   - It does NOT make all OKEMs public. Private/unpublished Skill OKEMs
--     remain readable only by their specialist.
--
-- Prerequisite: okems.skill_id column must exist
--   (applied by 20260829_link_skill_okem.sql before this migration runs).
-- Prerequisite: skills.is_public column must exist
--   (applied by 20260112_security_hardening.sql before this migration runs).

CREATE POLICY "Learners can read OKEMs of public skills" ON okems
    FOR SELECT
    USING (
        auth.uid()::text = specialist_id
        OR EXISTS (
            SELECT 1
            FROM   skills
            WHERE  skills.id = okems.skill_id
              AND  skills.is_public = true
        )
    );
