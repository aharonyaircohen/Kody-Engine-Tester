/**
 * Recursively freezes an object and all nested objects and arrays, making them immutable.
 * Handles: plain objects, arrays, Map, Set.
 * Uses Object.freeze in place — returns the same object.
 * @param value - The value to deeply freeze
 * @returns The same object, frozen in place
 */
export function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value)) {
    return value
  }

  seen.add(value)

  if (value instanceof Map) {
    for (const [, v] of value) {
      deepFreeze(v, seen)
    }
    return Object.freeze(value)
  }

  if (value instanceof Set) {
    for (const item of value) {
      deepFreeze(item, seen)
    }
    return Object.freeze(value)
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item, seen)
    }
    return Object.freeze(value)
  }

  for (const key of Object.keys(value)) {
    deepFreeze((value as Record<string, unknown>)[key], seen)
  }

  return Object.freeze(value)
}
