/**
 * Deeply merges source object into target object without mutating either.
 * Nested objects are recursively merged. Arrays are replaced by source values.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object representing the merged result
 */
export function deepMerge<
  T extends Record<string, unknown>,
  S extends Partial<Record<string, unknown>>
>(target: T, source: S): T {
  const result: Record<string, unknown> = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (sourceValue === null || sourceValue === undefined) {
      continue
    }

    if (sourceValue instanceof Date) {
      result[key] = sourceValue
    } else if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Partial<Record<string, unknown>>
      )
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}