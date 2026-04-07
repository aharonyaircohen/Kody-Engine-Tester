import { describe, expect, it } from 'vitest'

import { range } from './range'

describe('range', () => {
  it('range(1, 5) returns [1, 2, 3, 4, 5]', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('range(5, 1) returns [5, 4, 3, 2, 1]', () => {
    expect(range(5, 1)).toEqual([5, 4, 3, 2, 1])
  })

  it('range(0, 10, 2) returns [0, 2, 4, 6, 8, 10]', () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10])
  })

  it('range(-3, 3) returns [-3, -2, -1, 0, 1, 2, 3]', () => {
    expect(range(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2, 3])
  })

  it('range(5) returns [0, 1, 2, 3, 4]', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4])
  })

  it('range(0) returns []', () => {
    expect(range(0)).toEqual([])
  })

  it('range(3, 3) returns [3]', () => {
    expect(range(3, 3)).toEqual([3])
  })

  it('throws when step is 0', () => {
    expect(() => range(0, 5, 0)).toThrow('Step cannot be zero')
  })
})
