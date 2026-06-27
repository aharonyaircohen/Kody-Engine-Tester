import { describe, expect, it } from 'vitest'

import { factorial } from './factorial'

describe('factorial', () => {
  it('returns 1 for factorial(0)', () => {
    expect(factorial(0)).toBe(1)
  })

  it('returns 1 for factorial(1)', () => {
    expect(factorial(1)).toBe(1)
  })

  it('returns 120 for factorial(5)', () => {
    expect(factorial(5)).toBe(120)
  })

  it('returns 720 for factorial(6)', () => {
    expect(factorial(6)).toBe(720)
  })

  it('throws RangeError for negative input', () => {
    expect(() => factorial(-1)).toThrow(RangeError)
  })

  it('throws RangeError for non-integer input', () => {
    expect(() => factorial(1.5)).toThrow(RangeError)
  })
})
