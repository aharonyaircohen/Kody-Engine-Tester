import { describe, expect, it } from 'vitest'

import { median } from './median'

describe('median', () => {
  it('returns the middle element for an odd-length array', () => {
    expect(median([1, 2, 3])).toBe(2)
    expect(median([1, 2, 3, 4, 5])).toBe(3)
  })

  it('returns the mean of the two middle elements for an even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
    expect(median([1, 2, 3, 4, 5, 6])).toBe(3.5)
  })

  it('returns the element itself for a single-element array', () => {
    expect(median([42])).toBe(42)
    expect(median([-7])).toBe(-7)
  })

  it('handles negative numbers', () => {
    expect(median([-3, -1, 0, 2, 4])).toBe(0)
    expect(median([-10, -5, 0])).toBe(-5)
  })

  it('handles unsorted input without mutating the original', () => {
    const input = [5, 2, 8, 1, 9]
    const result = median(input)
    expect(result).toBe(5)
    expect(input).toEqual([5, 2, 8, 1, 9])
  })

  it('throws TypeError for an empty array', () => {
    expect(() => median([])).toThrow(TypeError)
    expect(() => median([])).toThrow('median of empty array')
  })
})
