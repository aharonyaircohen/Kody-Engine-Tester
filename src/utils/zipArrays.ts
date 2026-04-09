/**
 * Zips multiple arrays together into an array of tuples.
 * Stops at the shortest array when lengths are unequal.
 * @param arrays - The arrays to zip together
 * @returns An array of tuples, each containing one element from each input array
 */
export function zipArrays<T extends unknown[][]>(...arrays: T): Array<ZipArraysTuple<T>> {
  const length = Math.min(...arrays.map((arr) => arr.length))
  const result: Array<ZipArraysTuple<T>> = []

  for (let i = 0; i < length; i++) {
    result.push(arrays.map((arr) => arr[i]) as ZipArraysTuple<T>)
  }

  return result
}

type ZipArraysTuple<T extends unknown[][]> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never
}
