/**
 * Calculates the minimum number of edit operations (insertions, deletions, substitutions)
 * required to transform string `a` into string `b`.
 * Uses the classic dynamic programming approach with O(mn) time and space complexity.
 * @param a - The source string
 * @param b - The target string
 * @returns The edit distance between the two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length

  // Handle edge cases
  if (m === 0) return n
  if (n === 0) return m

  // Create DP matrix - dp[i][j] = edit distance between a[0..i-1] and b[0..j-1]
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        // Characters match - no extra cost
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        // Minimum of: delete (cost 1), insert (cost 1), substitute (cost 1)
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculates a normalized similarity score between 0 and 1 for two strings.
 * A score of 1 means identical strings, 0 means completely different.
 * @param a - The first string
 * @param b - The second string
 * @returns A similarity score between 0 (completely different) and 1 (identical)
 */
export function levenshteinSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1
  const distance = levenshteinDistance(a, b)
  const maxLength = Math.max(a.length, b.length)
  return 1 - distance / maxLength
}
