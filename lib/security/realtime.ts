import { getAdminClient } from '../supabase/server'
import { requireRole } from './permissions'
import { getUserCompany, validateSameCompany } from './tenant'
import { logAction } from './audit'
import { NEXUS_CHANNELS } from '../realtime-protocol'

/**
 * 🛰️ REALTIME MODULE: Secure Signal Gateway
 */
export async function sendSecureCommand({
  userId,
  techId,
  type,
  payload
}: {
  userId: string
  techId: string
  type: string
  payload: any
}) {
  const supabase = await getAdminClient()

  // 1. Resolve Tenant & Role
  const membership = await getUserCompany(userId)

  // 2. Validate Role (Experts or Admins only)
  requireRole(membership.role, ['owner', 'expert', 'admin'])

  // 3. Validate Technician (Multi-Tenant Alignment)
  await validateSameCompany(membership.company_id, techId)

  // 4. Send Command
  const channel = supabase.channel(NEXUS_CHANNELS.SUPPORT(techId))
  
  await channel.send({
    type: 'broadcast',
    event: 'ar-command',
    payload: {
        type,
        techId,
        expertId: userId,
        payload
    }
  })

  // 5. Audit Logging (Automatic)
  await logAction({
    userId,
    action: `SEND_COMMAND_${type}`,
    metadata: { techId, payload_summary: payload.message || 'No message' }
  })

  return { success: true }
}
