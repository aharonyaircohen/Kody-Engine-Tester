/**
 * Creates a new object with the specified keys omitted.
 * @param obj - The source object
 * @param keys - An array of keys to omit from the new object
 * @returns A new object with the specified keys removed
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result as Omit<T, K>
}
