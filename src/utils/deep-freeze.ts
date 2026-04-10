/**
 * Recursively freezes an object and all nested objects to prevent mutation.
 * Handles: plain objects, arrays, and nested combinations.
 * @param value - The value to freeze
 * @param seen - WeakSet for tracking circular references (internal use)
 * @returns The frozen object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  // Return primitives as-is (they are immutable)
  if (value === null || typeof value !== 'object') {
    return value
  }

  // Handle circular references - return without freezing again
  if (seen.has(value as object)) {
    return value
  }

  seen.add(value as object)

  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item, seen)
    }
  } else {
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key], seen)
    }
  }

  return Object.freeze(value as object) as T
}