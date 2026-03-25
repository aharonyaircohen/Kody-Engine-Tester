import { describe, it, expect } from 'vitest'
import { flatten } from './flatten'

describe('flatten', () => {
  it('should flatten a nested array', () => {
    const input = [1, [2, 3], [4, [5, 6]]]
    const expected = [1, 2, 3, 4, 5, 6]
    expect(flatten(input)).toEqual(expected)
  })

  it('should return an empty array for empty input', () => {
    expect(flatten([])).toEqual([])
  })

  it('should handle arrays with no nesting', () => {
    const input = [1, 2, 3, 4]
    expect(flatten(input)).toEqual([1, 2, 3, 4])
  })

  it('should handle arrays with strings', () => {
    const input = ['a', ['b', 'c'], ['d']]
    expect(flatten(input)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('should handle deeply nested arrays', () => {
    const input = [1, [2, [3, [4, [5]]]]]
    expect(flatten(input)).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle mixed types in arrays', () => {
    const input: (string | number | (string | number)[])[] = [1, ['a', 2], [3, 'b']]
    expect(flatten(input)).toEqual([1, 'a', 2, 3, 'b'])
  })
})
