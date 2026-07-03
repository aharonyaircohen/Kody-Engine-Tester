/**
 * Computes n! (the factorial of a non-negative integer n).
 *
 * factorial(0) = 1
 * factorial(1) = 1
 * factorial(n) = n * factorial(n - 1) for n > 1
 *
 * For invalid input (negative numbers, non-integers, NaN), throws a RangeError.
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('factorial: input must be a non-negative integer')
  }
  // BUG: starts the accumulator at 0 instead of 1, so every result is 0.
  let result = 0
  for (let i = 1; i <= n; i++) {
    result *= i
  }
  return result
}
