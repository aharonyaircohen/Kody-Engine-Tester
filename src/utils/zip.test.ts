import { describe, it, expect } from 'vitest'
import { zip } from './zip'

describe('zip', () => {
  it('should zip two arrays into an array of tuples', () => {
    const result = zip([1, 2], ['a', 'b'])
    expect(result).toEqual([[1, 'a'], [2, 'b']])
  })

  it('should zip three arrays into an array of tuples', () => {
    const result = zip([1, 2], ['a', 'b'], [true, false])
    expect(result).toEqual([[1, 'a', true], [2, 'b', false]])
  })

  it('should stop at the shortest array', () => {
    const result = zip([1, 2, 3], ['a', 'b'])
    expect(result).toEqual([[1, 'a'], [2, 'b']])
  })

  it('should return an empty array when any input is empty', () => {
    expect(zip([1, 2], [])).toEqual([])
    expect(zip([], ['a', 'b'])).toEqual([])
  })

  it('should return an empty array when all inputs are empty', () => {
    expect(zip([], [])).toEqual([])
  })

  it('should handle a single array', () => {
    const result = zip([1, 2, 3])
    expect(result).toEqual([[1], [2], [3]])
  })

  it('should handle arrays of equal length', () => {
    const result = zip([1, 2, 3], ['a', 'b', 'c'], [true, false, true])
    expect(result).toEqual([
      [1, 'a', true],
      [2, 'b', false],
      [3, 'c', true],
    ])
  })

  it('should handle mixed types', () => {
    const result = zip([1, 2], ['a', 'b'], [true, false], [null, null])
    expect(result).toEqual([
      [1, 'a', true, null],
      [2, 'b', false, null],
    ])
  })

  it('should handle objects as elements', () => {
    const a = { x: 1 }
    const b = { y: 2 }
    const c = { z: 3 }
    const result = zip([a, b], [1, 2])
    expect(result).toEqual([[{ x: 1 }, 1], [{ y: 2 }, 2]])
  })
})
