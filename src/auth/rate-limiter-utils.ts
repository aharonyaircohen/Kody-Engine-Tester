interface RateLimitEntry {
  timestamps: number[]
}

/**
 * In-memory rate limit store using sliding window algorithm.
 * Uses a Map to track request timestamps per key.
 */
const store = new Map<string, RateLimitEntry>()

/**
 * Checks if a request is allowed under the rate limit using a sliding window algorithm.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g., IP address, user ID)
 * @param maxRequests - Maximum number of requests allowed within the time window
 * @param windowMs - Time window in milliseconds
 * @returns Object with `allowed` boolean and optional `retryAfter` in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  const entry = store.get(key)
  const timestamps = entry?.timestamps ?? []

  // Filter to only timestamps within the current window
  const active = timestamps.filter((ts) => ts > windowStart)

  if (active.length < maxRequests) {
    // Allow request and record timestamp
    active.push(now)
    store.set(key, { timestamps: active })
    return { allowed: true }
  }

  // Deny request - calculate retryAfter based on oldest timestamp in window
  store.set(key, { timestamps: active })
  const retryAfter = active[0] + windowMs - now
  return { allowed: false, retryAfter }
}

/**
 * Resets the rate limit for a specific key, or clears all entries if no key provided.
 */
export function resetRateLimit(key?: string): void {
  if (key) {
    store.delete(key)
  } else {
    store.clear()
  }
}
