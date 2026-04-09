import { describe, expect, it } from 'vitest'

import { isOdd } from './math'

describe('isOdd', () => {
  it('returns true for positive odd numbers', () => {
    expect(isOdd(1)).toBe(true)
    expect(isOdd(3)).toBe(true)
    expect(isOdd(5)).toBe(true)
    expect(isOdd(17)).toBe(true)
    expect(isOdd(99)).toBe(true)
  })

  it('returns false for positive even numbers', () => {
    expect(isOdd(2)).toBe(false)
    expect(isOdd(4)).toBe(false)
    expect(isOdd(6)).toBe(false)
    expect(isOdd(18)).toBe(false)
    expect(isOdd(100)).toBe(false)
  })

  it('returns true for negative odd numbers', () => {
    expect(isOdd(-1)).toBe(true)
    expect(isOdd(-3)).toBe(true)
    expect(isOdd(-5)).toBe(true)
    expect(isOdd(-17)).toBe(true)
    expect(isOdd(-99)).toBe(true)
  })

  it('returns false for negative even numbers', () => {
    expect(isOdd(-2)).toBe(false)
    expect(isOdd(-4)).toBe(false)
    expect(isOdd(-6)).toBe(false)
    expect(isOdd(-18)).toBe(false)
    expect(isOdd(-100)).toBe(false)
  })

  it('returns false for zero', () => {
    expect(isOdd(0)).toBe(false)
  })
})
