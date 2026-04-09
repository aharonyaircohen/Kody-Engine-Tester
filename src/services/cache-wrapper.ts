interface CacheEntry<T> {
  value: T
  expiresAt: number
}

type PendingPromise = Promise<unknown>

const cache = new Map<string, CacheEntry<unknown> | PendingPromise>()

export function clearCache(): void {
  cache.clear()
}

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const now = Date.now()
  const entry = cache.get(key)

  if (entry !== undefined && !(entry instanceof Promise)) {
    if (entry.expiresAt > now) {
      return entry.value as T
    }
    cache.delete(key)
  }

  if (entry instanceof Promise) {
    return entry as Promise<T>
  }

  const promise = fn()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs })
      return value
    })
    .catch((error) => {
      cache.delete(key)
      throw error
    })

  cache.set(key, promise)
  return promise
}