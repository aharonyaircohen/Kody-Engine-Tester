type RateLimitEntry = {
  count: number
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true }
}

export function clearRateLimitStore(): void {
  store.clear()
}