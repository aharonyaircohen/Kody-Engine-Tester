function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Recursively merges the source object into the target object.
 * Nested plain objects are merged deeply, while arrays are replaced.
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns The merged target object
 */
export function merge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T & Record<string, unknown> {
  const result = { ...target } as Record<string, unknown>

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = merge(targetValue, sourceValue)
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue
    }
  }

  return result as T & Record<string, unknown>
}