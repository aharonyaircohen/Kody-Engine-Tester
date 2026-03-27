/**
 * Creates a new object with only the specified keys picked from the source object.
 * @param obj - The source object
 * @param keys - An array of keys to pick from the new object
 * @returns A new object with only the specified keys
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}
