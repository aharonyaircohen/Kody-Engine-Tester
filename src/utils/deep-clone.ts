/**
 * Creates a deep clone of any JavaScript value.
 * Handles: plain objects, arrays, Date, RegExp, Map, Set, and nested combinations.
 * Throws an error if a circular reference is detected.
 * @param value - The value to deep clone
 * @returns A deep copy of the value
 */
export function deepClone<T>(value: T, seen = new WeakSet()): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value as object)) {
    throw new Error('Circular reference detected')
  }

  seen.add(value as object)

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T
  }

  if (value instanceof Map) {
    const cloned = new Map()
    for (const [k, v] of value) {
      cloned.set(deepClone(k, seen), deepClone(v, seen))
    }
    return cloned as T
  }

  if (value instanceof Set) {
    const cloned = new Set()
    for (const item of value) {
      cloned.add(deepClone(item, seen))
    }
    return cloned as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item, seen)) as T
  }

  const cloned: Record<string, unknown> = {}
  for (const key of Object.keys(value as object)) {
    cloned[key] = deepClone((value as Record<string, unknown>)[key], seen)
  }
  return cloned as T
}
