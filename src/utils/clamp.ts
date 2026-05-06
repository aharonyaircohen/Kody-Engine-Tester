/**
 * @example clamp(15, 0, 10) // returns 10
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
