import { describe, expect, it } from 'vitest'

import sum from './sum'

describe('sum', () => {
  it('returns 0 for an empty array', () => {
    expect(sum([])).toBe(0)
  })

  it('returns the number itself for a single element array', () => {
    expect(sum([5])).toBe(5)
  })

  it('sums multiple numbers', () => {
    expect(sum([1, 2, 3])).toBe(6)
    expect(sum([10, 20, 30, 40])).toBe(100)
  })

  it('handles negative numbers', () => {
    expect(sum([-1, -2, -3])).toBe(-6)
    expect(sum([5, -3, 2])).toBe(4)
  })

  it('handles floating point numbers', () => {
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6)
  })
})