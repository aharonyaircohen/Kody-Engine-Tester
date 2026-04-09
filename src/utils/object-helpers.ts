/**
 * Recursively merges source into target without mutating either.
 * Source values override target values for primitive properties.
 * For nested objects, merge is applied recursively.
 * Arrays are replaced (not concatenated) by default.
 * Handles: Date, RegExp, Map, Set, plain objects, and arrays.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object representing the merged result
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result: Record<string, unknown> = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key as keyof T]
    const targetValue = target[key as keyof T]

    if (sourceValue === null || sourceValue === undefined) {
      result[key] = sourceValue
    } else if (isDate(sourceValue)) {
      result[key] = new Date(sourceValue.getTime())
    } else if (sourceValue instanceof RegExp) {
      result[key] = new RegExp(sourceValue.source, sourceValue.flags)
    } else if (sourceValue instanceof Map) {
      result[key] = new Map(sourceValue)
    } else if (sourceValue instanceof Set) {
      result[key] = new Set(sourceValue)
    } else if (Array.isArray(sourceValue)) {
      result[key] = [...sourceValue]
    } else if (isPlainObject(sourceValue)) {
      result[key] = deepMerge(
        isPlainObject(targetValue) ? (targetValue as Record<string, unknown>) : {},
        sourceValue as Partial<Record<string, unknown>>
      )
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}

/**
 * Checks if a value is a plain object (not Date, RegExp, Map, Set, Array, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Checks if a value is a Date instance
 */
function isDate(value: unknown): value is Date {
  return value instanceof Date
}
