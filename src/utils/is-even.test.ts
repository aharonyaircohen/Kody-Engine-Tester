import { describe, it, expect } from 'vitest'
import { isEven, isOdd } from './is-even'

describe('isEven', () => {
  it('returns true for even numbers', () => {
    expect(isEven(0)).toBe(true)
    expect(isEven(2)).toBe(true)
    expect(isEven(100)).toBe(true)
    expect(isEven(-4)).toBe(true)
  })

  it('returns false for odd numbers', () => {
    expect(isEven(1)).toBe(false)
    expect(isEven(3)).toBe(false)
    expect(isEven(99)).toBe(false)
    expect(isEven(-3)).toBe(false)
  })
})

describe('isOdd', () => {
  it('returns true for odd numbers', () => {
    expect(isOdd(1)).toBe(true)
    expect(isOdd(3)).toBe(true)
    expect(isOdd(99)).toBe(true)
    expect(isOdd(-3)).toBe(true)
  })

  it('returns false for even numbers', () => {
    expect(isOdd(0)).toBe(false)
    expect(isOdd(2)).toBe(false)
    expect(isOdd(100)).toBe(false)
    expect(isOdd(-4)).toBe(false)
  })
})