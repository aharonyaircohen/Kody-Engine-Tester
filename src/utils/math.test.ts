import { describe, expect, it } from 'vitest'

import { add, isOdd } from './math'

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

describe('add', () => {
  it('returns correct sum for positive numbers', () => {
    expect(add(1, 2)).toBe(3)
    expect(add(5, 10)).toBe(15)
    expect(add(100, 200)).toBe(300)
  })

  it('returns correct sum for negative numbers', () => {
    expect(add(-1, -2)).toBe(-3)
    expect(add(-5, -10)).toBe(-15)
    expect(add(-100, -200)).toBe(-300)
  })

  it('returns correct sum for mixed positive and negative', () => {
    expect(add(-1, 2)).toBe(1)
    expect(add(5, -10)).toBe(-5)
    expect(add(100, -50)).toBe(50)
  })

  it('returns correct sum with zero', () => {
    expect(add(0, 0)).toBe(0)
    expect(add(5, 0)).toBe(5)
    expect(add(0, 5)).toBe(5)
  })
})
