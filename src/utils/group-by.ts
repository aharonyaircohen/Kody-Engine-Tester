/**
 * Groups an array of items by a key derived from a key function.
 * @param items - The array of items to group
 * @param keyFn - Function that returns a string key for each item
 * @returns An object mapping each key to an array of matching items
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
