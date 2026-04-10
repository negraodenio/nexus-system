/**
 * ⚡ RATE LIMIT MODULE: Anti-Abuse Shield
 * Memory-based for ultra-low latency. 
 * Note: Reset on server restart. For distributed, use Redis or Postgres api_rate_limits.
 */
const memory = new Map<string, { count: number; time: number }>()

export function rateLimit(key: string, limit = 100, windowMs = 60000) {
  const now = Date.now()
  const record = memory.get(key)

  if (!record) {
    memory.set(key, { count: 1, time: now })
    return
  }

  // Reset window
  if (now - record.time > windowMs) {
    memory.set(key, { count: 1, time: now })
    return
  }

  if (record.count >= limit) {
    console.warn(`[Security:RateLimit] Limit reached for key: ${key}`)
    throw new Error('Rate limit exceeded')
  }

  record.count++
}
