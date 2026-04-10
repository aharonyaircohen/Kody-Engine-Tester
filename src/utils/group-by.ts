type KeyFn<T> = (item: T) => string | number
type KeySelector<T> = keyof T | KeyFn<T>

function resolveKey<T>(item: T, key: KeySelector<T>): string | number {
  if (typeof key === 'function') {
    return (key as KeyFn<T>)(item)
  }
  return String(item[key])
}

export function groupBy<T>(array: T[], key: KeySelector<T>): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of array) {
    const resolved = resolveKey(item, key)
    const k = String(resolved)
    if (!result[k]) {
      result[k] = []
    }
    result[k].push(item)
  }
  return result
}
