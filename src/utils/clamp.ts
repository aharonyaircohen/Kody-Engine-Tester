/**
 * Clamps a value between a minimum and maximum.
 * @param value - The value to clamp
 * @param min - The minimum bound
 * @param max - The maximum bound
 * @returns The clamped value
 * @throws {Error} When min is greater than max
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error('min cannot be greater than max')
  }
  if (value < min) return min
  if (value > max) return max
  return value
}
