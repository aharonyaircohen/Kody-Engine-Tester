import { describe, expect, it } from 'vitest'

import { isString } from './string'

describe('isString', () => {
  it('returns true for string inputs', () => {
    expect(isString('')).toBe(true)
    expect(isString('hello')).toBe(true)
    expect(isString('123')).toBe(true)
  })

  it('returns false for number inputs', () => {
    expect(isString(0)).toBe(false)
    expect(isString(123)).toBe(false)
    expect(isString(-456)).toBe(false)
    expect(isString(3.14)).toBe(false)
    expect(isString(NaN)).toBe(false)
    expect(isString(Infinity)).toBe(false)
  })

  it('returns false for boolean inputs', () => {
    expect(isString(true)).toBe(false)
    expect(isString(false)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isString(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isString(undefined)).toBe(false)
  })

  it('returns false for object inputs', () => {
    expect(isString({})).toBe(false)
    expect(isString({ key: 'value' })).toBe(false)
  })

  it('returns false for array inputs', () => {
    expect(isString([])).toBe(false)
    expect(isString([1, 2, 3])).toBe(false)
    expect(isString(['a', 'b'])).toBe(false)
  })

  it('returns false for function inputs', () => {
    expect(isString(() => {})).toBe(false)
    expect(isString(function () {})).toBe(false)
  })

  it('returns false for symbol inputs', () => {
    expect(isString(Symbol('test'))).toBe(false)
  })

  it('returns false for bigint inputs', () => {
    expect(isString(BigInt(123))).toBe(false)
  })
})