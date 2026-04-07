type PlainObject = Record<string, unknown>

/**
 * Deeply merges two objects, with values from the second object
 * taking precedence for conflicting keys.
 * @param target - The base object
 * @param source - The object to merge into the target
 * @returns A new object representing the deep merge
 */
export function merge<T extends PlainObject, S extends PlainObject>(
  target: T,
  source: S
): T & S {
  const result: PlainObject = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = merge(
        targetValue as PlainObject,
        sourceValue as PlainObject
      )
    } else {
      result[key] = sourceValue
    }
  }

  return result as T & S
}
