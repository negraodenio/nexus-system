'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '../db-types'

/**
 * NEXUS IRON SHIELD: Admin Client
 * This client bypasses RLS and MUST ONLY be used in Server Actions,
 * API Routes, or Background Jobs.
 * 
 * DIRECTIVE 'use server' ensures this code NEVER reaches the browser.
 */
export async function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("IRON SHIELD: Missing Critical Admin Credentials")
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
