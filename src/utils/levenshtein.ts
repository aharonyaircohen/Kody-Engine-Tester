/**
 * Computes the Levenshtein (edit) distance between two strings.
 * The distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change
 * one string into the other.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length

  // Handle edge cases
  if (m === 0) return n
  if (n === 0) return m

  // Use two rows instead of full matrix for O(min(m,n)) space
  // We swap to ensure we iterate over the shorter string in the inner loop
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let curr = new Array(n + 1).fill(0)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1]
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1])
      }
    }
    ;[prev, curr] = [curr, prev]
  }

  return prev[n]
}
