export type Comparator<T> = (a: T, b: T) => number

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Finds the leftmost position where value could be inserted to maintain sorted order.
 * Returns the index of the first element greater than value.
 */
export function bisectLeft<T>(
  arr: T[],
  value: T,
  comparator?: Comparator<T>,
): number {
  const compare = comparator ?? defaultCompare
  let low = 0
  let high = arr.length

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (compare(arr[mid], value) < 0) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * Finds the rightmost position where value could be inserted to maintain sorted order.
 * Returns the index after all elements equal to value.
 */
export function bisectRight<T>(
  arr: T[],
  value: T,
  comparator?: Comparator<T>,
): number {
  const compare = comparator ?? defaultCompare
  let low = 0
  let high = arr.length

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (compare(arr[mid], value) <= 0) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * Inserts value into array in place, maintaining sorted order.
 * Returns the index where value was inserted.
 */
export function insort<T>(
  arr: T[],
  value: T,
  comparator?: Comparator<T>,
): number {
  const idx = bisectRight(arr, value, comparator)
  arr.splice(idx, 0, value)
  return idx
}
