interface CacheEntry<V> {
  value: V
  expiresAt: number
}

type PendingEntry = { promise: Promise<unknown>; expiresAt: number }

const cache = new Map<string, CacheEntry<unknown> | PendingEntry>()

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const now = Date.now()
  const entry = cache.get(key)

  if (entry !== undefined && 'value' in entry && now < entry.expiresAt) {
    return entry.value as T
  }

  if (entry !== undefined && 'promise' in entry && now < entry.expiresAt) {
    return entry.promise as Promise<T>
  }

  const promise = fn()

  cache.set(key, {
    promise,
    expiresAt: now + ttlMs,
  } as PendingEntry)

  try {
    const value = await promise

    cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })

    return value
  } catch (error) {
    cache.delete(key)
    throw error
  }
}

export function clearCache(): void {
  cache.clear()
}
