/**
 * Flattens a nested array into a single-level array.
 * @param arr - The array to flatten (can contain nested arrays)
 * @returns A flattened array
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce((acc: T[], item) => {
    if (Array.isArray(item)) {
      acc.push(...flatten(item))
    } else {
      acc.push(item)
    }
    return acc
  }, [])
}
