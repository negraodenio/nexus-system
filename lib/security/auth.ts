import { createClient } from '@/lib/supabase-server'
import type { User } from '@supabase/supabase-js'

/**
 * 🔐 AUTH MODULE: Identity Verification
 *
 * REQUIRES the incoming NextRequest to be forwarded so the SSR client
 * can read the sb-access-token / sb-refresh-token cookies set by the
 * Supabase JS client in the browser.
 *
 * NEVER use getAdminClient() here — the admin/service-role client has
 * no session context and will always return user = null.
 */
export async function getAuthenticatedUser(req?: Request): Promise<User> {
  // createClient() reads cookies() from next/headers, which are populated
  // by the Next.js App Router from the incoming request headers.
  // This works correctly inside API Route Handlers and Server Actions.
  const supabase = await createClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('[Security:Auth] Unauthorized — no valid session in request cookies.')
    throw new Error('Unauthorized')
  }

  return user
}
