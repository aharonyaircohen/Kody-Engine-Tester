import { describe, expect, it } from 'vitest'

import { percentile } from './percentile'

describe('percentile', () => {
  it('p=0 returns the minimum', () => {
    expect(percentile([3, 1, 2], 0)).toBe(1)
  })

  it('p=100 returns the maximum', () => {
    expect(percentile([3, 1, 2], 100)).toBe(3)
  })

  it('p=50 returns the median for odd-length array', () => {
    expect(percentile([1, 2, 3], 50)).toBe(2)
  })

  it('p=50 interpolates for even-length array', () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5)
  })

  it('handles interpolated values', () => {
    expect(percentile([1, 2, 3, 4, 5], 25)).toBe(2)
  })

  it('handles fractional rank interpolation', () => {
    // rank = 33 * 3 / 100 = 0.99, floor=0, ceil=1, fraction=0.99
    // 1 + 0.99 * (2 - 1) = 1.99
    expect(percentile([1, 2, 3, 4], 33)).toBeCloseTo(1.99)
  })

  it('returns the same element for single-element array', () => {
    expect(percentile([42], 0)).toBe(42)
    expect(percentile([42], 50)).toBe(42)
    expect(percentile([42], 100)).toBe(42)
  })

  it('handles unsorted input correctly', () => {
    expect(percentile([5, 2, 8, 1], 50)).toBe(3.5)
  })

  it('does not mutate the input array', () => {
    const arr = [3, 1, 2]
    percentile(arr, 50)
    expect(arr).toEqual([3, 1, 2])
  })

  it('throws TypeError for empty array', () => {
    expect(() => percentile([], 50)).toThrow(TypeError)
  })

  it('throws RangeError for p < 0', () => {
    expect(() => percentile([1, 2, 3], -1)).toThrow(RangeError)
  })

  it('throws RangeError for p > 100', () => {
    expect(() => percentile([1, 2, 3], 101)).toThrow(RangeError)
  })

  it('handles p=100 with multi-element array', () => {
    expect(percentile([1, 2, 3, 4, 5], 100)).toBe(5)
  })

  it('handles median for simple array', () => {
    expect(percentile([10, 20, 30], 50)).toBe(20)
  })
})
