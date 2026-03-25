type NestedArray<T> = (T | NestedArray<T>)[]

/**
 * Flattens an arbitrarily nested array into a single-level array.
 * @param arr - The array to flatten (supports arbitrary nesting depth)
 * @returns A flattened array containing all leaf elements
 */
export function flatten<T>(arr: NestedArray<T>): T[] {
  return arr.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flatten(item as NestedArray<T>))
    } else {
      acc.push(item as T)
    }
    return acc
  }, [])
}
