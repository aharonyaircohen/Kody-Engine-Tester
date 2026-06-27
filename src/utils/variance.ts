export function variance(nums: number[]): number {
  if (nums.length === 0) {
    throw new TypeError('variance requires at least one number')
  }

  const mean = nums.reduce((acc, num) => acc + num, 0) / nums.length

  const squaredDeviations = nums.map((num) => Math.pow(num - mean, 2))

  return squaredDeviations.reduce((acc, val) => acc + val, 0) / nums.length
}
