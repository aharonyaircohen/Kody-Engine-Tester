import { describe, expect, it } from 'vitest'

import { variance } from './variance'

describe('variance', () => {
  it('returns 0 for a single element array', () => {
    expect(variance([5])).toBe(0)
  })

  it('returns the correct variance for a known dataset', () => {
    // Dataset: [2, 4, 4, 4, 5, 5, 7, 9]
    // Mean = 40/8 = 5
    // Variance = ((2-5)² + (4-5)² + (4-5)² + (4-5)² + (5-5)² + (5-5)² + (7-5)² + (9-5)²) / 8
    //          = (9 + 1 + 1 + 1 + 0 + 0 + 4 + 16) / 8 = 32/8 = 4
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBe(4)
  })

  it('handles negative numbers', () => {
    // Dataset: [-2, -1, 0, 1, 2]
    // Mean = 0/5 = 0
    // Variance = (4 + 1 + 0 + 1 + 4) / 5 = 10/5 = 2
    expect(variance([-2, -1, 0, 1, 2])).toBe(2)
  })

  it('throws TypeError for an empty array', () => {
    expect(() => variance([])).toThrow(TypeError)
    expect(() => variance([])).toThrow('variance requires at least one number')
  })

  it('does not mutate the input array', () => {
    const nums = [1, 2, 3]
    variance(nums)
    expect(nums).toEqual([1, 2, 3])
  })
})
