import { describe, it, expect } from 'vitest'
import { paginate } from './pagination'

describe('paginate', () => {
  it('should return the first page of items', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = paginate(items, 1, 2)
    expect(result.data).toEqual([1, 2])
    expect(result.total).toBe(6)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(true)
  })

  it('should return the middle page of items', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = paginate(items, 2, 2)
    expect(result.data).toEqual([3, 4])
    expect(result.total).toBe(6)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(true)
  })

  it('should return the last page of items', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = paginate(items, 3, 2)
    expect(result.data).toEqual([5, 6])
    expect(result.total).toBe(6)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(false)
  })

  it('should handle empty array', () => {
    const result = paginate([], 1, 2)
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
    expect(result.pages).toBe(0)
    expect(result.hasNext).toBe(false)
  })

  it('should return all items when page size is larger than array length', () => {
    const items = [1, 2, 3]
    const result = paginate(items, 1, 10)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.total).toBe(3)
    expect(result.pages).toBe(1)
    expect(result.hasNext).toBe(false)
  })

  it('should handle single item per page', () => {
    const items = [1, 2, 3]
    const result = paginate(items, 2, 1)
    expect(result.data).toEqual([2])
    expect(result.total).toBe(3)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(true)
  })

  it('should paginate an array of strings', () => {
    const items = ['a', 'b', 'c', 'd']
    const result = paginate(items, 1, 2)
    expect(result.data).toEqual(['a', 'b'])
    expect(result.total).toBe(4)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(true)
  })

  it('should handle objects in array', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]
    const result = paginate(items, 1, 2)
    expect(result.data).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
    expect(result.total).toBe(3)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(true)
  })

  it('should throw an error for pageSize <= 0', () => {
    expect(() => paginate([1, 2, 3], 1, 0)).toThrow(
      'Page size must be greater than 0',
    )
    expect(() => paginate([1, 2, 3], 1, -1)).toThrow(
      'Page size must be greater than 0',
    )
  })

  it('should throw an error for page < 1', () => {
    expect(() => paginate([1, 2, 3], 0, 2)).toThrow(
      'Page must be greater than or equal to 1',
    )
    expect(() => paginate([1, 2, 3], -1, 2)).toThrow(
      'Page must be greater than or equal to 1',
    )
  })

  it('should handle page beyond total pages', () => {
    const items = [1, 2, 3, 4, 5]
    const result = paginate(items, 10, 2)
    expect(result.data).toEqual([])
    expect(result.total).toBe(5)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(false)
  })

  it('should handle exact division of items into pages', () => {
    const items = [1, 2, 3, 4]
    const result = paginate(items, 2, 2)
    expect(result.data).toEqual([3, 4])
    expect(result.total).toBe(4)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(false)
  })
})
