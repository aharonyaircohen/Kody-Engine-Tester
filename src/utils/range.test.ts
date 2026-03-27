import { describe, expect, it } from 'vitest'

import { range } from './range'

describe('range', () => {
  it('range(5) returns [0,1,2,3,4]', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4])
  })

  it('range(2, 5) returns [2,3,4]', () => {
    expect(range(2, 5)).toEqual([2, 3, 4])
  })

  it('range(0, 10, 2) returns [0,2,4,6,8]', () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8])
  })

  it('range(5, 0, -1) returns [5,4,3,2,1]', () => {
    expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1])
  })

  it('range(0) returns []', () => {
    expect(range(0)).toEqual([])
  })

  it('range(3, 3) returns []', () => {
    expect(range(3, 3)).toEqual([])
  })

  it('throws when step is 0', () => {
    expect(() => range(0, 5, 0)).toThrow('Step cannot be zero')
  })

  it('throws when step direction is wrong (positive step, start > end)', () => {
    expect(() => range(5, 0, 1)).toThrow()
  })

  it('throws when step direction is wrong (negative step, start < end)', () => {
    expect(() => range(0, 5, -1)).toThrow()
  })
})
