/**
 * Browser / SSR client factory.
 *
 * ⚠️  THIS FILE IS IMPORTED BY CLIENT COMPONENTS.
 * ⚠️  NEVER import getAdminClient or SUPABASE_SERVICE_ROLE_KEY here.
 * ⚠️  Admin operations belong exclusively in lib/supabase/server.ts
 *     which is guarded by 'use server' and never reaches the browser bundle.
 */
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './db-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isValidConfig = (url?: string, key?: string) =>
    url && key && url.startsWith('http')

export const supabase = isValidConfig(supabaseUrl, supabaseKey)
    ? createBrowserClient<Database>(supabaseUrl!, supabaseKey!)
    : ({} as unknown as ReturnType<typeof createBrowserClient<Database>>) // Fail on use, not on import
