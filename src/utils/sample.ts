/**
 * Returns a random element from an array.
 * @param arr - The array to sample from
 * @returns A random element from the array, or undefined if the array is empty
 */
export function sample<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Returns N random elements from an array without replacement.
 * @param arr - The array to sample from
 * @param n - The number of elements to sample
 * @returns An array of N random elements, or all elements if N >= array length
 */
export function sampleN<T>(arr: T[], n: number): T[] {
  if (arr.length === 0 || n <= 0) return []
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}
