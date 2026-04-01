import { describe, it, expect } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('should return an array with the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('should not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const original = [...input]
    shuffle(input)
    expect(input).toEqual(original)
  })

  it('should produce different results on repeated calls without seed', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // With a large enough array, two random shuffles should almost certainly differ
    const result1 = shuffle(input)
    const result2 = shuffle(input)
    // There's a tiny chance they could be equal, but very unlikely with 10 elements
    expect(result1).not.toEqual(result2)
  })

  it('should produce reproducible results with the same seed', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result1 = shuffle(input, 12345)
    const result2 = shuffle(input, 12345)
    expect(result1).toEqual(result2)
  })

  it('should produce different results with different seeds', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result1 = shuffle(input, 12345)
    const result2 = shuffle(input, 67890)
    expect(result1).not.toEqual(result2)
  })

  it('should handle an empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('should handle a single element array', () => {
    expect(shuffle([1])).toEqual([1])
  })

  it('should handle an array of strings', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const result = shuffle(input)
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('should work with objects', () => {
    const input = [{ a: 1 }, { b: 2 }, { c: 3 }]
    const result = shuffle(input)
    expect(result.sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)))).toEqual(input)
  })

  it('should work with mixed types', () => {
    const input: (string | number | boolean)[] = [1, 'a', true, 2, 'b']
    const result = shuffle(input)
    expect(result.sort()).toEqual([1, 2, 'a', 'b', true])
  })

  it('should handle a two-element array', () => {
    const input = [1, 2]
    const result = shuffle(input)
    expect(result.sort()).toEqual([1, 2])
  })
})
