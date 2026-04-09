interface CacheEntry<V> {
  value: V
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const entry = cache.get(key)

  if (entry !== undefined && Date.now() < entry.expiresAt) {
    return entry.value as T
  }

  const value = await fn()

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })

  return value
}

export function clearCache(): void {
  cache.clear()
}
