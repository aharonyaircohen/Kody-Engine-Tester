/**
 * Returns a new array with duplicate values removed.
 * @param arr - The array to deduplicate
 * @returns A new array containing only the first occurrence of each value
 */
export function unique<T extends string | number>(arr: T[]): T[] {
  return [...new Set(arr)]
}
