import { Cache } from '@/utils/cache'

const cache = new Cache<string, unknown>()

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached !== undefined) {
    return cached as T
  }

  const result = await fn()
  cache.set(key, result, ttlMs)
  return result
}
