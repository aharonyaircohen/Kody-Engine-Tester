import { describe, expect, it } from 'vitest'

import { fibonacci } from './fibonacci'

describe('fibonacci', () => {
  it('returns empty array when count is 0', () => {
    expect(fibonacci(0)).toEqual([])
  })

  it('returns [0] when count is 1', () => {
    expect(fibonacci(1)).toEqual([0])
  })

  it('returns first two numbers correctly', () => {
    expect(fibonacci(2)).toEqual([0, 1])
  })

  it('returns correct sequence for count 5', () => {
    expect(fibonacci(5)).toEqual([0, 1, 1, 2, 3])
  })

  it('returns correct sequence for count 10', () => {
    expect(fibonacci(10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34])
  })

  it('throws when count is negative', () => {
    expect(() => fibonacci(-1)).toThrow('Count cannot be negative')
  })
})