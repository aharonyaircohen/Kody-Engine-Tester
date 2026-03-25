export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const keysToOmit = new Set<PropertyKey>(keys)
  const result = {} as Omit<T, K>
  for (const key of Object.keys(obj)) {
    if (!keysToOmit.has(key)) {
      ;(result as Record<string, unknown>)[key] = obj[key]
    }
  }
  return result
}
