export type MemoizedFunction<T extends (...args: Parameters<T>) => ReturnType<T>> = T & {
  clear: () => void
}

export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T
): MemoizedFunction<T> {
  const cache = new Map<string, ReturnType<T>>()

  const memoized = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as MemoizedFunction<T>

  memoized.clear = () => cache.clear()

  return memoized
}
