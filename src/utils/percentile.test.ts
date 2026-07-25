import { describe, expect, it } from 'vitest'

import { percentile } from './percentile'

describe('percentile', () => {
  it('returns the minimum for p=0', () => {
    expect(percentile([5, 3, 1, 4, 2], 0)).toBe(1)
  })

  it('returns the maximum for p=100', () => {
    expect(percentile([5, 3, 1, 4, 2], 100)).toBe(5)
  })

  it('returns the median for p=50', () => {
    expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3)
  })

  it('interpolates between ranks when p does not land on an index', () => {
    const result = percentile([1, 2, 3, 4], 25)
    expect(result).toBe(1.75)
  })

  it('handles a single element array', () => {
    expect(percentile([42], 0)).toBe(42)
    expect(percentile([42], 50)).toBe(42)
    expect(percentile([42], 100)).toBe(42)
  })

  it('does not mutate the input array', () => {
    const input = [5, 3, 1, 4, 2]
    const copy = [...input]
    percentile(input, 50)
    expect(input).toEqual(copy)
  })

  it('works with unsorted input', () => {
    expect(percentile([10, 2, 8, 4, 6], 50)).toBe(6)
    expect(percentile([10, 2, 8, 4, 6], 0)).toBe(2)
    expect(percentile([10, 2, 8, 4, 6], 100)).toBe(10)
  })

  it('throws TypeError for empty array', () => {
    expect(() => percentile([], 50)).toThrow(TypeError)
    expect(() => percentile([], 50)).toThrow('Cannot compute percentile of empty array')
  })

  it('throws RangeError for p below 0', () => {
    expect(() => percentile([1, 2, 3], -1)).toThrow(RangeError)
    expect(() => percentile([1, 2, 3], -1)).toThrow('Percentile p must be between 0 and 100')
  })

  it('throws RangeError for p above 100', () => {
    expect(() => percentile([1, 2, 3], 101)).toThrow(RangeError)
    expect(() => percentile([1, 2, 3], 101)).toThrow('Percentile p must be between 0 and 100')
  })
})
