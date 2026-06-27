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
  let result = 1
  for (let i = 1; i <= n; i++) {
    result *= i
  }
  // 0! and 1! both return 1 (the loop body is skipped for n=0 and n=1)
  return result
}
