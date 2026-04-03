import { describe, expect, it } from 'vitest'

import { arraySum } from './array-sum'

describe('arraySum', () => {
  it('returns 0 for an empty array', () => {
    expect(arraySum([])).toBe(0)
  })

  it('returns the value itself for a single element', () => {
    expect(arraySum([5])).toBe(5)
    expect(arraySum([0])).toBe(0)
  })

  it('sums basic arrays correctly', () => {
    expect(arraySum([1, 2, 3])).toBe(6)
    expect(arraySum([10, 20, 30])).toBe(60)
  })

  it('handles negative numbers', () => {
    expect(arraySum([-1, -2, -3])).toBe(-6)
    expect(arraySum([-5, 5])).toBe(0)
    expect(arraySum([-10, 2, 3])).toBe(-5)
  })

  it('handles floating point numbers', () => {
    expect(arraySum([0.1, 0.2, 0.3])).toBeCloseTo(0.6)
    expect(arraySum([-0.5, 1.5])).toBe(1)
  })

  it('handles large arrays', () => {
    const large = Array.from({ length: 1000 }, (_, i) => i + 1)
    expect(arraySum(large)).toBe(500500)
  })
})