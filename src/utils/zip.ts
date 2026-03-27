/**
 * Combines multiple arrays into an array of tuples.
 * Stops at the shortest array when lengths are unequal.
 * @param arrays - The arrays to zip together
 * @returns An array of tuples, each containing one element from each input array
 */
export function zip<T extends unknown[][]>(...arrays: T): Array<ZipTuple<T>> {
  const length = Math.min(...arrays.map((arr) => arr.length))
  const result: Array<ZipTuple<T>> = []

  for (let i = 0; i < length; i++) {
    result.push(arrays.map((arr) => arr[i]) as ZipTuple<T>)
  }

  return result
}

type ZipTuple<T extends unknown[][]> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never
}
