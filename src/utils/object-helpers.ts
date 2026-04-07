/**
 * Recursively merges source into target without mutating target.
 * Nested objects are deeply merged; arrays are replaced.
 * @param target - The target object
 * @param source - The source object with partial overrides
 * @returns A new object representing the merged result
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result: Record<string, unknown> = { ...target }

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as object,
        sourceValue as Partial<typeof targetValue>
      )
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}
