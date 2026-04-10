function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function cloneSpecialObject(value: unknown): unknown {
  if (value instanceof Date) {
    return new Date(value.getTime())
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags)
  }
  if (value instanceof Map) {
    const cloned = new Map()
    for (const [k, v] of value) {
      cloned.set(k, v)
    }
    return cloned
  }
  if (value instanceof Set) {
    const cloned = new Set()
    for (const item of value) {
      cloned.add(item)
    }
    return cloned
  }
  return null
}

/**
 * Recursively merges source into target without mutating either.
 * For nested objects, values are deeply merged. For arrays, source replaces target.
 * Handles Date, RegExp, Map, and Set as atomic values (not deep merged).
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object with merged values
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result: Record<string, unknown> = { ...target }

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (sourceValue === null || sourceValue === undefined) {
      result[key] = sourceValue
    } else if (
      isPlainObject(sourceValue) &&
      isPlainObject(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else if (
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue) &&
      (sourceValue instanceof Date || sourceValue instanceof RegExp ||
        sourceValue instanceof Map || sourceValue instanceof Set)
    ) {
      result[key] = cloneSpecialObject(sourceValue)
    } else {
      result[key] = Array.isArray(sourceValue)
        ? [...sourceValue]
        : typeof sourceValue === 'object' && sourceValue !== null
          ? { ...sourceValue }
          : sourceValue
    }
  }

  return result as T
}
