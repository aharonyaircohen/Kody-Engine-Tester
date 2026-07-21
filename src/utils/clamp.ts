/**
 * Clamps a number within a specified range [min, max].
 *
 * @example
 * clamp(15, 0, 10) // returns 10
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error('min cannot be greater than max')
  }
  if (value < min) return min
  if (value > max) return max
  return value
}
