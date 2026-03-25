import { describe, it, expect } from 'vitest'
import { isEmpty } from './is-empty'

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true)
  })

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('should return false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false)
  })

  it('should return false for non-empty array', () => {
    expect(isEmpty([1, 2, 3])).toBe(false)
  })

  it('should return false for non-empty object', () => {
    expect(isEmpty({ key: 'value' })).toBe(false)
  })

  it('should return false for numbers (zero and non-zero)', () => {
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(42)).toBe(false)
  })

  it('should return false for boolean false', () => {
    expect(isEmpty(false)).toBe(false)
  })

  it('should return false for boolean true', () => {
    expect(isEmpty(true)).toBe(false)
  })
})
