import { describe, it, expect } from 'vitest'
import { partition } from './partition'

describe('partition', () => {
  it('should partition an array into truthy and falsy groups', () => {
    const input = [1, 2, 3, 4, 5]
    const predicate = (n: number) => n % 2 === 0
    const expected: [number[], number[]] = [[2, 4], [1, 3, 5]]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should return empty arrays for empty input', () => {
    const input: number[] = []
    const predicate = (n: number) => n > 0
    const expected: [number[], number[]] = [[], []]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should return all items in truthy array when all match predicate', () => {
    const input = [2, 4, 6, 8]
    const predicate = (n: number) => n % 2 === 0
    const expected: [number[], number[]] = [[2, 4, 6, 8], []]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should return all items in falsy array when none match predicate', () => {
    const input = [1, 3, 5, 7]
    const predicate = (n: number) => n % 2 === 0
    const expected: [number[], number[]] = [[], [1, 3, 5, 7]]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should partition an array of strings', () => {
    const input = ['apple', 'banana', 'cherry', 'date']
    const predicate = (s: string) => s.length > 5
    const expected: [string[], string[]] = [['banana', 'cherry'], ['apple', 'date']]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should handle object types', () => {
    const input = [
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
      { name: 'Charlie', active: true },
    ]
    const predicate = (obj: { name: string; active: boolean }) => obj.active
    const expected = [
      [
        { name: 'Alice', active: true },
        { name: 'Charlie', active: true },
      ],
      [{ name: 'Bob', active: false }],
    ]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should handle mixed types', () => {
    const input: (string | number | boolean)[] = [1, 'a', 2, 'b', true, false]
    const predicate = (item: string | number | boolean) => typeof item === 'string'
    const expected: [(string | number | boolean)[], (string | number | boolean)[]] = [
      ['a', 'b'],
      [1, 2, true, false],
    ]
    expect(partition(input, predicate)).toEqual(expected)
  })

  it('should preserve the original order within each group', () => {
    const input = [1, 2, 3, 4, 5]
    const predicate = (n: number) => n > 3
    const result = partition(input, predicate)
    expect(result[0]).toEqual([4, 5])
    expect(result[1]).toEqual([1, 2, 3])
  })

  it('should handle single element array', () => {
    const input = [42]
    const predicate = (n: number) => n > 10
    const expected: [number[], number[]] = [[42], []]
    expect(partition(input, predicate)).toEqual(expected)
  })
})
