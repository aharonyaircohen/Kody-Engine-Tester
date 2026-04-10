/**
 * Deeply merges source properties into target without mutating the original.
 * Handles nested plain objects recursively; arrays are replaced (not merged).
 * @param target - The target object to merge into
 * @param source - The source partial to merge
 * @returns A new object with merged properties
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result: Record<string, unknown> = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      )
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue
    }
  }

  return result as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
