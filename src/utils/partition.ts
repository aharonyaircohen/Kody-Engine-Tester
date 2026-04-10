/**
 * Splits an array into two groups based on a predicate function.
 * @param array - The array to partition
 * @param predicate - The function that determines group membership
 * @returns A tuple containing two arrays: [itemsWherePredicateWasTrue, itemsWherePredicateWasFalse]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const truthy: T[] = []
  const falsy: T[] = []

  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item)
    } else {
      falsy.push(item)
    }
  }

  return [truthy, falsy]
}
