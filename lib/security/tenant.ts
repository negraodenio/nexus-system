import { getAdminClient } from '../supabase/server'

/**
 * 🏢 TENANT MODULE: Multi-Tenant Isolation
 */
export async function getUserCompany(userId: string) {
  const supabase = await getAdminClient()

  const { data, error } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    console.error(`[Security:Tenant] No company found for user ${userId}`)
    throw new Error('Tenant not found')
  }

  return data
}

/**
 * 🚨 Cross-tenant Guard
 */
export async function validateSameCompany(
  userCompanyId: string,
  targetUserId: string
) {
  const supabase = await getAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', targetUserId)
    .single()

  if (error || !data || data.company_id !== userCompanyId) {
    console.error(`[Security:Tenant] SECURITY BREACH: User ${targetUserId} does not belong to company ${userCompanyId}`)
    throw new Error('Cross-tenant access denied')
  }
}
