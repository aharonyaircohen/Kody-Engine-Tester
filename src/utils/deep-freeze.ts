/**
 * Recursively freezes an object and all nested objects and arrays.
 * Handles: plain objects, arrays, and nested combinations.
 * @param value - The value to deep freeze
 * @returns The deeply frozen value
 */
export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item)
    }
  } else {
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key])
    }
  }

  return value
}