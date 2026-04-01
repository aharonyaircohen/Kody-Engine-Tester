export type Comparator<T> = (a: T, b: T) => number

function defaultCompare<T extends string | number>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Returns the common elements between two arrays.
 * Preserves order from the first array.
 * @param arr1 - The first array (order is preserved from this array)
 * @param arr2 - The second array
 * @param compareFn - Optional custom comparator function
 * @returns A new array containing elements common to both arrays
 */
export function intersection<T extends string | number>(
  arr1: T[],
  arr2: T[],
  compareFn?: Comparator<T>,
): T[] {
  const compare = compareFn ?? defaultCompare
  const set = new Set<T>()

  for (const item of arr2) {
    set.add(item)
  }

  const result: T[] = []
  for (const item of arr1) {
    if (set.has(item)) {
      result.push(item)
      set.delete(item)
    }
  }

  return result
}

/**
 * Returns the common elements between two arrays using a custom comparator.
 * Preserves order from the first array.
 * @param arr1 - The first array (order is preserved from this array)
 * @param arr2 - The second array
 * @param compareFn - Custom comparator function (a, b) => 0 if equal
 * @returns A new array containing elements common to both arrays
 */
export function intersectionWith<T>(
  arr1: T[],
  arr2: T[],
  compareFn: (a: T, b: T) => boolean,
): T[] {
  const result: T[] = []
  const used = new Set<number>()

  for (const item1 of arr1) {
    for (let i = 0; i < arr2.length; i++) {
      if (!used.has(i) && compareFn(item1, arr2[i])) {
        result.push(item1)
        used.add(i)
        break
      }
    }
  }

  return result
}