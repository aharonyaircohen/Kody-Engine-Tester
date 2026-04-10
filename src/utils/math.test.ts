import { describe, expect, it } from 'vitest'

import { add } from './math'

describe('add', () => {
  it('returns the sum of two positive numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('returns the sum of two negative numbers', () => {
    expect(add(-2, -3)).toBe(-5)
  })

  it('returns the sum of a positive and negative number', () => {
    expect(add(5, -3)).toBe(2)
  })

  it('returns the sum when one number is zero', () => {
    expect(add(0, 5)).toBe(5)
    expect(add(5, 0)).toBe(5)
  })

  it('returns zero when both numbers are zero', () => {
    expect(add(0, 0)).toBe(0)
  })

  it('works with floating point numbers', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    expect(add(-0.5, 0.3)).toBeCloseTo(-0.2)
  })
})