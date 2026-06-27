/**
 * Clamps a value between min and max.
 *
 * @param value - The value to clamp (must be a finite number)
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns The clamped value
 * @throws Error if value is NaN or if min is greater than max
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('value must be a finite number')
  }
  if (min > max) {
    throw new Error('min cannot be greater than max')
  }
  if (value < min) return min
  if (value > max) return max
  return value
}