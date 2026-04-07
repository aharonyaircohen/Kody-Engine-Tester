// In-memory store for rate limiting: key -> array of timestamps
const store = new Map<string, number[]>()

export interface RateLimitCheckResult {
  allowed: boolean
  retryAfter?: number
}

/**
 * Checks if a request is allowed under a sliding window rate limit.
 *
 * @param key - Unique identifier for the client/action (e.g., IP address, user ID)
 * @param maxRequests - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed boolean and optional retryAfter milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitCheckResult {
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
  const retryAfter = active[0] + windowMs - now
  return { allowed: false, retryAfter }
}

/**
 * Resets the rate limit store for a specific key, or clears all entries if no key provided.
 */
export function resetRateLimitStore(key?: string): void {
  if (key) {
    store.delete(key)
  } else {
    store.clear()
  }
}
