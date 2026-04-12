/**
 * Groups an array of objects by a key function.
 * @param items - The array of objects to group
 * @param keyFn - Function that returns the key to group by
 * @returns An object with keys corresponding to unique values returned by keyFn, and values being arrays of matching items
 */
export function groupBy<T>(items: readonly T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of items) {
    const key = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  }
  return result
}
