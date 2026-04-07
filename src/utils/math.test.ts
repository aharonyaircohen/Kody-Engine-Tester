import { describe, expect, it } from 'vitest'

import { isEven } from './math'

describe('isEven', () => {
  it('returns true for even positive numbers', () => {
    expect(isEven(2)).toBe(true)
    expect(isEven(4)).toBe(true)
    expect(isEven(100)).toBe(true)
  })

  it('returns false for odd positive numbers', () => {
    expect(isEven(1)).toBe(false)
    expect(isEven(3)).toBe(false)
    expect(isEven(99)).toBe(false)
  })

  it('returns true for zero', () => {
    expect(isEven(0)).toBe(true)
  })

  it('returns true for even negative numbers', () => {
    expect(isEven(-2)).toBe(true)
    expect(isEven(-4)).toBe(true)
    expect(isEven(-100)).toBe(true)
  })

  it('returns false for odd negative numbers', () => {
    expect(isEven(-1)).toBe(false)
    expect(isEven(-3)).toBe(false)
    expect(isEven(-99)).toBe(false)
  })

  it('throws for floating point numbers', () => {
    expect(() => isEven(1.5)).toThrow('Input must be an integer')
    expect(() => isEven(-2.5)).toThrow('Input must be an integer')
  })

  it('throws for NaN', () => {
    expect(() => isEven(NaN)).toThrow('Input must be an integer')
  })

  it('throws for Infinity', () => {
    expect(() => isEven(Infinity)).toThrow('Input must be an integer')
    expect(() => isEven(-Infinity)).toThrow('Input must be an integer')
  })
})
