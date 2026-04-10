/**
 * Recursively merges source objects into a target object.
 * Arrays are replaced (not concatenated).
 * @param target - The target object to merge into
 * @param sources - One or more source objects to merge
 * @returns The merged target object
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  for (const source of sources) {
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
        target[key] = deepMerge(targetValue as any, sourceValue as any) as T[keyof T]
      } else {
        target[key] = sourceValue as T[keyof T]
      }
    }
  }
  return target
}
