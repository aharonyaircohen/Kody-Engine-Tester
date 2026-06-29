/**
 * Calculates the p-th percentile of a number array using linear interpolation.
 * @param nums - The array of numbers
 * @param p - The percentile to calculate (0–100)
 * @returns The p-th percentile value
 * @throws {TypeError} If the array is empty
 * @throws {RangeError} If p is outside the range 0–100
 */
export function percentile(nums: number[], p: number): number {
  if (nums.length === 0) {
    throw new TypeError('Array must not be empty')
  }

  if (p < 0 || p > 100) {
    throw new RangeError('p must be between 0 and 100')
  }

  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const rank = (p * (n - 1)) / 100

  if (Number.isInteger(rank)) {
    return sorted[rank]
  }

  const floorIdx = Math.floor(rank)
  const ceilIdx = Math.ceil(rank)
  const fraction = rank - floorIdx

  return sorted[floorIdx] + fraction * (sorted[ceilIdx] - sorted[floorIdx])
}
