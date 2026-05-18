export function percentile(nums: number[], p: number): number {
  if (nums.length === 0) {
    throw new TypeError('Cannot compute percentile of empty array')
  }
  if (p < 0 || p > 100) {
    throw new RangeError('Percentile p must be between 0 and 100')
  }

  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length

  if (n === 1) {
    return sorted[0]
  }

  const rank = (p / 100) * (n - 1)
  const lower = Math.floor(rank)
  const upper = Math.ceil(rank)

  if (lower === upper) {
    return sorted[lower]
  }

  const fraction = rank - lower
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower])
}
