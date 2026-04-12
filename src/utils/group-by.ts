/**
 * Groups an array of objects by a specified key.
 * @param array - The array of objects to group
 * @param key - The key to group by
 * @returns An object with keys corresponding to unique values of the specified key, and values being arrays of matching items
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of array) {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
  }
  return result
}
