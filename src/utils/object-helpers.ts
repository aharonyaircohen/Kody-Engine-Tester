/**
 * Recursively merges source into target without mutating either.
 * Nested plain objects are merged recursively; arrays are replaced.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object representing the merged result
 */
export function deepMerge<T extends object>(target: T, source: Partial<any>): T {
  const result: Record<string, unknown> = { ...target } as Record<string, unknown>

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = (target as Record<string, unknown>)[key]

    if (sourceValue === null || typeof sourceValue !== 'object') {
      result[key] = sourceValue
    } else if (Array.isArray(sourceValue)) {
      result[key] = [...sourceValue]
    } else if (sourceValue instanceof Date) {
      result[key] = new Date(sourceValue.getTime())
    } else if (sourceValue instanceof RegExp) {
      result[key] = new RegExp(sourceValue.source, sourceValue.flags)
    } else if (sourceValue instanceof Map) {
      const cloned = new Map()
      for (const [k, v] of sourceValue) {
        cloned.set(k, v)
      }
      result[key] = cloned
    } else if (sourceValue instanceof Set) {
      const cloned = new Set()
      for (const item of sourceValue) {
        cloned.add(item)
      }
      result[key] = cloned
    } else if (targetValue !== null && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
      result[key] = deepMerge(targetValue as object, sourceValue as object)
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}
