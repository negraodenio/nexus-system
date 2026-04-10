import { getAdminClient } from '../supabase/server'

/**
 * 🔐 AUTH MODULE: Identity Verification
 * Strictly Server-Side.
 */
export async function getAuthenticatedUser() {
  const supabase = await getAdminClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.error("[Security:Auth] Unauthorized access attempt blocked.")
    throw new Error('Unauthorized')
  }

  return user
}
