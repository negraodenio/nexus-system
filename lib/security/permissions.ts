/**
 * 👑 PERMISSIONS MODULE: Role-Based Access Control
 */
export function requireRole(userRole: string, allowed: string[]) {
  if (!allowed.includes(userRole)) {
    console.error(`[Security:Permissions] ACCESS DENIED: Role '${userRole}' not in allowed list [${allowed.join(',')}]`)
    throw new Error('Forbidden: Insufficient Permissions')
  }
}
