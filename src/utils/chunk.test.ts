import { describe, it, expect } from 'vitest'
import { chunk } from './chunk'

describe('chunk', () => {
  it('should chunk an array into groups of specified size', () => {
    const input = [1, 2, 3, 4, 5, 6]
    const expected = [[1, 2], [3, 4], [5, 6]]
    expect(chunk(input, 2)).toEqual(expected)
  })

  it('should handle remainder elements in the last chunk', () => {
    const input = [1, 2, 3, 4, 5]
    const expected = [[1, 2], [3, 4], [5]]
    expect(chunk(input, 2)).toEqual(expected)
  })

  it('should return an empty array for empty input', () => {
    expect(chunk([], 2)).toEqual([])
  })

  it('should return a single chunk when size is larger than array length', () => {
    const input = [1, 2, 3]
    const expected = [[1, 2, 3]]
    expect(chunk(input, 5)).toEqual(expected)
  })

  it('should chunk an array of strings', () => {
    const input = ['a', 'b', 'c', 'd']
    const expected = [['a', 'b', 'c'], ['d']]
    expect(chunk(input, 3)).toEqual(expected)
  })

  it('should chunk an array with size of 1', () => {
    const input = [1, 2, 3]
    const expected = [[1], [2], [3]]
    expect(chunk(input, 1)).toEqual(expected)
  })

  it('should throw an error for size <= 0', () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow('Chunk size must be greater than 0')
    expect(() => chunk([1, 2, 3], -1)).toThrow('Chunk size must be greater than 0')
  })

  it('should handle mixed types', () => {
    const input: (string | number)[] = [1, 'a', 2, 'b', 3]
    const expected = [[1, 'a'], [2, 'b'], [3]]
    expect(chunk(input, 2)).toEqual(expected)
  })
})
