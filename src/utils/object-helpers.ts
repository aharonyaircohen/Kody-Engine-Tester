/**
 * Deeply merges source object into target object without mutating the original.
 * Arrays are replaced rather than concatenated. Nested objects are merged recursively.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object representing the merged result
 */
export function deepMerge<T extends object>(
  target: T,
  source: Partial<Record<string, unknown>>,
): T {
  const result: Record<string, unknown> = { ...(target as Record<string, unknown>) }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = (target as Record<string, unknown>)[key]

    if (sourceValue === null || sourceValue === undefined) {
      result[key] = sourceValue
    } else if (
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      sourceValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue) &&
      targetValue !== null
    ) {
      result[key] = deepMerge(targetValue, sourceValue as Partial<Record<string, unknown>>)
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}
