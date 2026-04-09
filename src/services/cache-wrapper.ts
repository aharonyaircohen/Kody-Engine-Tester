interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (entry !== undefined && entry.expiresAt > Date.now()) {
    return entry.value
  }

  const value = await fn()
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

export function clearCache(key?: string): void {
  if (key === undefined) {
    store.clear()
  } else {
    store.delete(key)
  }
}
