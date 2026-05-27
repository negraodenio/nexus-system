import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Database } from './db-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const isValidConfig = (url?: string, key?: string) => url && key && url.startsWith('http')

export const supabase = isValidConfig(supabaseUrl, supabaseKey)
    ? createBrowserClient<Database>(supabaseUrl!, supabaseKey!)
    : {} as unknown as ReturnType<typeof createBrowserClient<Database>> // Prevent crash, will fail on use

export const supabaseAdmin = isValidConfig(supabaseUrl, supabaseServiceKey)
    ? createClient<Database>(supabaseUrl!, supabaseServiceKey!)
    : supabase as any
