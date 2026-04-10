interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count < maxRequests) {
    entry.count++
    return { allowed: true }
  }

  return { allowed: false, retryAfter: entry.resetAt - now }
}

export function resetRateLimit(key?: string): void {
  if (key) {
    store.delete(key)
  } else {
    store.clear()
  }
}
