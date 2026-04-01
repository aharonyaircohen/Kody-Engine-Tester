import { describe, it, expect } from 'vitest'
import { intersection, intersectionWith } from './intersection'

describe('intersection', () => {
  it('should return empty arrays when both inputs are empty', () => {
    expect(intersection([], [])).toEqual([])
  })

  it('should return empty array when first array is empty', () => {
    expect(intersection([], [1, 2, 3])).toEqual([])
  })

  it('should return empty array when second array is empty', () => {
    expect(intersection([1, 2, 3], [])).toEqual([])
  })

  it('should return common numbers', () => {
    expect(intersection([1, 2, 3, 4], [3, 4, 5, 6])).toEqual([3, 4])
  })

  it('should return common strings', () => {
    expect(intersection(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['b', 'c'])
  })

  it('should preserve order from first array', () => {
    expect(intersection([4, 2, 3, 1], [1, 2, 3, 4])).toEqual([4, 2, 3, 1])
  })

  it('should not duplicate common elements', () => {
    expect(intersection([1, 1, 2, 2, 3], [1, 2, 3])).toEqual([1, 2, 3])
  })

  it('should return same array when both arrays are identical', () => {
    expect(intersection([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3])
  })

  it('should return empty when no common elements', () => {
    expect(intersection([1, 2, 3], [4, 5, 6])).toEqual([])
  })
})

describe('intersectionWith', () => {
  it('should work with custom comparator for objects', () => {
    const arr1 = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const arr2 = [{ id: 2, name: 'B' }, { id: 3, name: 'c' }]
    expect(intersectionWith(arr1, arr2, (a, b) => a.id === b.id)).toEqual([{ id: 2, name: 'b' }])
  })

  it('should preserve order from first array with custom comparator', () => {
    const arr1 = [{ id: 3 }, { id: 1 }, { id: 2 }]
    const arr2 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(intersectionWith(arr1, arr2, (a, b) => a.id === b.id)).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }])
  })

  it('should use each element from second array at most once', () => {
    const arr1 = [{ id: 1 }, { id: 1 }]
    const arr2 = [{ id: 1 }]
    expect(intersectionWith(arr1, arr2, (a, b) => a.id === b.id)).toEqual([{ id: 1 }])
  })

  it('should return empty arrays when both inputs are empty', () => {
    expect(intersectionWith([], [], () => false)).toEqual([])
  })
})