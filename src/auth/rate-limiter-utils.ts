// In-memory rate limiter using sliding window algorithm
const store = new Map<string, number[]>()

/**
 * Check if a request is allowed under the rate limit.
 * Uses a sliding window algorithm to track request timestamps per key.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowStart = now - windowMs
  const timestamps = store.get(key) ?? []
  const active = timestamps.filter((ts) => ts > windowStart)

  if (active.length < maxRequests) {
    active.push(now)
    store.set(key, active)
    return { allowed: true }
  }

  store.set(key, active)
  const retryAfter = Math.ceil((active[0] + windowMs - now) / 1000)
  return { allowed: false, retryAfter }
}

/**
 * Reset rate limit state for a specific key, or all keys if no key provided.
 */
export function resetRateLimit(key?: string): void {
  if (key) {
    store.delete(key)
  } else {
    store.clear()
  }
}
