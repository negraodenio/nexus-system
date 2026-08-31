/**
 * @fileoverview RLS learner SELECT policy — migration-content tests
 *
 * These tests assert the DDL content of the R3 migration file
 * directly. They verify the policy structure without requiring
 * a live Supabase database.
 *
 * INTEGRATION GAP (documented):
 *   Runtime enforcement of RLS policies (SELECT under auth.uid,
 *   INSERT/UPDATE/DELETE ownership, private-Skill isolation) cannot
 *   be proven by Jest alone — it requires a live Supabase integration
 *   test with real auth tokens and a populated skills/okems tables.
 *   See docs/RLS-integration-tests.md for the test plan.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const MIGRATION_PATH = join(
    __dirname,
    '..',
    '..',
    'supabase',
    'migrations',
    '20260831_okem_learner_read.sql'
)

let sql: string

beforeAll(() => {
    sql = readFileSync(MIGRATION_PATH, 'utf8')
})

describe('R3 migration — additive learner SELECT policy (DDL content)', () => {
    it('exists and is non-empty', () => {
        expect(sql.length).toBeGreaterThan(0)
    })

    it('creates exactly one SELECT policy on okems', () => {
        const selectPolicies = (sql.match(/CREATE POLICY[\s\S]*?FOR SELECT/g) ?? []).length
        expect(selectPolicies).toBe(1)
    })

    it('does not modify INSERT / UPDATE / DELETE ownership policies', () => {
        expect(sql).not.toMatch(/FOR INSERT/)
        expect(sql).not.toMatch(/FOR UPDATE/)
        expect(sql).not.toMatch(/FOR DELETE/)
    })

    it('preserves the specialist-owner access condition', () => {
        expect(sql).toMatch(/auth\.uid\(\)::text\s*=\s*specialist_id/)
    })

    it('adds a public-skill EXISTS clause for learner access', () => {
        expect(sql).toMatch(/EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+skills\s+WHERE\s+skills\.id\s*=\s*okems\.skill_id/)
        expect(sql).toMatch(/skills\.is_public\s*=\s*true/)
    })

    it('does NOT make all OKEMs public (no unconditional USING (true) on okems)', () => {
        const unconditionalPublic = (sql.match(/ON okems[\s\S]*?FOR SELECT[\s\S]*?USING\s*\(\s*true\s*\)/g) ?? []).length
        expect(unconditionalPublic).toBe(0)
    })

    it('scoped to okems only (no other table affected)', () => {
        const okemsSelects = (sql.match(/CREATE POLICY[\s\S]*?FOR SELECT/g) ?? []).length
        expect(okemsSelects).toBe(1)
        const otherTables = (sql.match(/ON (?!okems\b)\w+\s+FOR SELECT/g) ?? []).length
        expect(otherTables).toBe(0)
    })
})
