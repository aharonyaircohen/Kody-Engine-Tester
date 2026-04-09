/**
 * In-memory sliding window rate limiter utility.
 * Uses a Map to track request timestamps per key.
 */

const store = new Map<string, number[]>()

export interface RateLimitCheckResult {
  allowed: boolean
  retryAfter?: number
}

/**
 * Checks if a request is allowed under the rate limit using sliding window algorithm.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g., IP address, user ID)
 * @param maxRequests - Maximum number of requests allowed within the time window
 * @param windowMs - Time window in milliseconds
 * @returns Result indicating if the request is allowed and when to retry if not
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
 * Resets the rate limit counter for a specific key.
 * Useful for testing or admin operations.
 */
export function resetRateLimit(key: string): void {
  store.delete(key)
}

/**
 * Clears all rate limit counters.
 * Useful for testing.
 */
export function clearAllRateLimits(): void {
  store.clear()
}

/**
 * Returns the number of tracked rate limit keys.
 * Useful for testing and monitoring.
 */
export function getRateLimitStoreSize(): number {
  return store.size
}