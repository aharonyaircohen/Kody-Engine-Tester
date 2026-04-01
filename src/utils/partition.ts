/**
 * Splits an array into two groups based on a predicate function.
 * @param arr - The array to partition
 * @param predicate - Function that returns true for elements to include in the first group
 * @returns A tuple where the first element contains matching elements and the second contains non-matching
 */
export function partition<T>(
  arr: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  return arr.reduce(
    ([matches, nonMatches], item) =>
      predicate(item)
        ? [[...matches, item], nonMatches]
        : [matches, [...nonMatches, item]],
    [[], []] as [T[], T[]],
  )
}

/**
 * Splits an array into two groups based on an async predicate function.
 * @param arr - The array to partition
 * @param predicate - Async function that returns true for elements to include in the first group
 * @returns A promise resolving to a tuple where the first element contains matching elements and the second contains non-matching
 */
export async function partitionAsync<T>(
  arr: readonly T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<[T[], T[]]> {
  const evaluated = await Promise.all(
    arr.map(async (item) => ({ item, match: await predicate(item) })),
  )

  return evaluated.reduce(
    ([matches, nonMatches], { item, match }) =>
      match ? [[...matches, item], nonMatches] : [matches, [...nonMatches, item]],
    [[], []] as [T[], T[]],
  )
}
