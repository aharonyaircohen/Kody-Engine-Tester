/**
 * Divides an array into chunks of a specified size.
 * @param arr - The array to chunk
 * @param size - The maximum number of elements per chunk; must be a positive integer
 * @returns An array of arrays, each with at most size elements
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error('Chunk size must be a positive integer')
  }

  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}
