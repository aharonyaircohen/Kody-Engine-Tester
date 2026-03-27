export type Comparator<T> = (a: T, b: T) => number

function naturalCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * A generic sorted array that maintains elements in order using binary search.
 * Provides O(log n) lookup, insertion, and membership tests.
 */
export class SortedArray<T> {
  private items: T[] = []
  private compare: Comparator<T>

  /**
   * Creates a new SortedArray.
   * @param comparator - Optional comparator function. Defaults to natural order.
   */
  constructor(comparator?: Comparator<T>) {
    this.compare = comparator ?? naturalCompare
  }

  /**
   * Binary search to find the index of an exact match, or the bitwise complement
   * of the insertion point if not found.
   */
  private binarySearch(value: T): number {
    let low = 0
    let high = this.items.length

    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      const cmp = this.compare(this.items[mid], value)
      if (cmp < 0) {
        low = mid + 1
      } else if (cmp > 0) {
        high = mid
      } else {
        return mid
      }
    }
    return ~low
  }

  /**
   * Inserts a value into the sorted array. O(log n) insertion.
   */
  insert(value: T): void {
    const idx = this.binarySearch(value)
    if (idx >= 0) {
      // value already exists — insert after duplicates (stable)
      this.items.splice(idx + 1, 0, value)
    } else {
      this.items.splice(~idx, 0, value)
    }
  }

  /**
   * Removes the first occurrence of a value.
   * Returns true if the value was found and removed.
   */
  remove(value: T): boolean {
    const idx = this.indexOf(value)
    if (idx === -1) return false
    this.items.splice(idx, 1)
    return true
  }

  /**
   * Checks if a value exists in the array. O(log n) lookup.
   */
  has(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  /**
   * Returns the index of the first occurrence of a value, or -1 if not found.
   */
  indexOf(value: T): number {
    const idx = this.lowerBound(value)
    if (idx < this.items.length && this.compare(this.items[idx], value) === 0) {
      return idx
    }
    return -1
  }

  /**
   * Returns all elements in the range [min, max] (inclusive).
   */
  range(min: T, max: T): T[] {
    const start = this.lowerBound(min)
    const end = this.upperBound(max)
    return this.items.slice(start, end)
  }

  /** First index where value > target */
  private upperBound(target: T): number {
    let low = 0
    let high = this.items.length
    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (this.compare(this.items[mid], target) <= 0) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  /** First index where value >= target */
  private lowerBound(target: T): number {
    let low = 0
    let high = this.items.length
    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (this.compare(this.items[mid], target) < 0) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  /**
   * Returns a copy of the underlying array.
   */
  toArray(): T[] {
    return [...this.items]
  }

  /** Returns the number of elements. */
  size(): number {
    return this.items.length
  }

  /** Returns true if the array contains no elements. */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /** Iterator for for...of loops. */
  *[Symbol.iterator](): Iterator<T> {
    yield* this.items
  }
}
