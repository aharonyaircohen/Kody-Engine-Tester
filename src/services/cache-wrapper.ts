interface CacheEntry<T> {
  value: T
  expiresAt: number | null
}

const cache = new Map<string, CacheEntry<unknown>>()

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const entry = cache.get(key)

  if (entry !== undefined) {
    const cached = entry as CacheEntry<T>
    if (cached.expiresAt === null || Date.now() < cached.expiresAt) {
      return cached.value
    }
    cache.delete(key)
  }

  const value = await fn()
  cache.set(key, {
    value,
    expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null,
  })
  return value
}

export function clearCache(): void {
  cache.clear()
}
