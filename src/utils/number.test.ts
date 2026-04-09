import { describe, expect, it } from 'vitest'

import { isNumber } from './number'

describe('isNumber', () => {
  it('returns true for integers', () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(42)).toBe(true)
    expect(isNumber(-42)).toBe(true)
  })

  it('returns true for floating point numbers', () => {
    expect(isNumber(0.5)).toBe(true)
    expect(isNumber(-3.14)).toBe(true)
    expect(isNumber(1e10)).toBe(true)
  })

  it('returns false for NaN', () => {
    expect(isNumber(NaN)).toBe(false)
  })

  it('returns false for non-number types', () => {
    expect(isNumber('42')).toBe(false)
    expect(isNumber('hello')).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber({})).toBe(false)
    expect(isNumber([])).toBe(false)
    expect(isNumber(true)).toBe(false)
    expect(isNumber(false)).toBe(false)
  })

  it('narrowing works correctly in type guards', () => {
    const values: unknown[] = [42, 'hello', null, 3.14, NaN, undefined]

    const numbers = values.filter(isNumber)
    expect(numbers).toEqual([42, 3.14])
  })
})