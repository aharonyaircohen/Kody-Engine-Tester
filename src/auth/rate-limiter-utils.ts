interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * In-memory rate limit store keyed by identifier
 */
const store = new Map<string, RateLimitEntry>()

/**
 * Check if a request is allowed under the rate limit.
 * Uses a fixed window approach with automatic expiration.
 *
 * @param key - Unique identifier (e.g., IP address, user ID, API key)
 * @param maxRequests - Maximum requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed boolean and optional retryAfter (seconds until reset)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()

  const entry = store.get(key)

  // No existing entry or window has expired - start fresh
  if (!entry || now >= entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { allowed: true }
  }

  // Within window - check count
  if (entry.count < maxRequests) {
    entry.count++
    return { allowed: true }
  }

  // Window exhausted - calculate retry after in seconds
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
  return { allowed: false, retryAfter }
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
  store.delete(key)
}

/**
 * Clear all rate limit entries
 */
export function clearRateLimitStore(): void {
  store.clear()
}

/**
 * Get current entry for a key (useful for testing)
 */
export function getRateLimitEntry(key: string): RateLimitEntry | undefined {
  return store.get(key)
}
