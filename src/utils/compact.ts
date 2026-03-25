/**
 * Removes all falsy values from an array.
 * Falsy values include: null, undefined, 0, false, '', and NaN
 * @param arr - The array to compact
 * @returns A new array with all falsy values removed
 */
export function compact<T>(arr: (T | null | undefined | 0 | false | '')[]): T[] {
  return arr.filter(Boolean) as T[]
}
