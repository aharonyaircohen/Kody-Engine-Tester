/**
 * Fixed-window rate limiter utility using in-memory Map.
 * Tracks request counts per key within a configurable time window.
 */

interface WindowEntry {
  count: number
  windowStart: number
}

const store = new Map<string, WindowEntry>()

/**
 * Check if a request is allowed under the rate limit using fixed-window algorithm.
 * When the time window expires, the request count resets.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g., IP, user ID)
 * @param maxRequests - Maximum requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed boolean and optional retryAfter (seconds until retry)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowStart = Math.floor(now / windowMs) * windowMs
  const entry = store.get(key)

  if (!entry || entry.windowStart !== windowStart) {
    store.set(key, { count: 1, windowStart })
    return { allowed: true }
  }

  if (entry.count < maxRequests) {
    entry.count++
    return { allowed: true }
  }

  const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000)
  return { allowed: false, retryAfter }
}

/**
 * Reset rate limit for a specific key. Used for testing.
 */
export function resetRateLimit(key?: string): void {
  if (key) {
    store.delete(key)
  } else {
    store.clear()
  }
}
