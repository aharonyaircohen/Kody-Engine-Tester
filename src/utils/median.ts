export function median(nums: number[]): number {
  if (nums.length === 0) {
    throw new TypeError('median of empty array')
  }
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 !== 0) {
    return sorted[mid]
  }
  return (sorted[mid - 1] + sorted[mid]) / 2
}
