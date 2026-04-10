import { getAdminClient } from '../supabase/server'

/**
 * 🧾 AUDIT MODULE: Enterprise Traceability
 */
export async function logAction({
  userId,
  action,
  metadata
}: {
  userId: string
  action: string
  metadata?: any
}) {
  try {
    const supabase = await getAdminClient()

    const { error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        metadata
    })

    if (error) {
        console.warn("[Security:Audit] Failed to insert audit log:", error.message)
    }
  } catch (err) {
    console.error("[Security:Audit] Critical audit failure:", err)
  }
}
