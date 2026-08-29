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
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = await getAdminClient()

    // audit_logs requires table_name and record_id — we use '_app' for application-level events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { error } = await db.from('audit_logs').insert({
        table_name: '_app',
        record_id: userId,
        action: 'INSERT',
        new_data: metadata ?? null,
        user_id: userId,
    })

    if (error) {
        console.warn("[Security:Audit] Failed to insert audit log:", error.message)
    }
  } catch (err) {
    console.error("[Security:Audit] Critical audit failure:", err)
  }
}
