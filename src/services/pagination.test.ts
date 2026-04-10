import { describe, it, expect } from 'vitest'
import { paginate } from './pagination'

describe('paginate', () => {
  it('should return the first page of items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = paginate(items, 1, 3)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.total).toBe(10)
    expect(result.pages).toBe(4)
    expect(result.hasNext).toBe(true)
  })

  it('should return the middle page of items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = paginate(items, 2, 3)
    expect(result.data).toEqual([4, 5, 6])
    expect(result.total).toBe(10)
    expect(result.pages).toBe(4)
    expect(result.hasNext).toBe(true)
  })

  it('should return the last page of items with remainder', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = paginate(items, 4, 3)
    expect(result.data).toEqual([10])
    expect(result.total).toBe(10)
    expect(result.pages).toBe(4)
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

  it('should return empty data array for page beyond total pages', () => {
    const items = [1, 2, 3, 4, 5]
    const result = paginate(items, 10, 3)
    expect(result.data).toEqual([])
    expect(result.total).toBe(5)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(false)
  })

  it('should return empty data array for empty input', () => {
    const items: number[] = []
    const result = paginate(items, 1, 10)
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
    expect(result.pages).toBe(0)
    expect(result.hasNext).toBe(false)
  })

  it('should handle page size of 1', () => {
    const items = [1, 2, 3]
    const result = paginate(items, 2, 1)
    expect(result.data).toEqual([2])
    expect(result.total).toBe(3)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(true)
  })

  it('should work with string arrays', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const result = paginate(items, 1, 2)
    expect(result.data).toEqual(['a', 'b'])
    expect(result.total).toBe(5)
    expect(result.pages).toBe(3)
    expect(result.hasNext).toBe(true)
  })

  it('should work with objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = paginate(items, 1, 2)
    expect(result.data).toEqual([{ id: 1 }, { id: 2 }])
    expect(result.total).toBe(3)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(true)
  })

  it('should throw an error for page less than 1', () => {
    expect(() => paginate([1, 2, 3], 0, 10)).toThrow('Page must be greater than or equal to 1')
    expect(() => paginate([1, 2, 3], -1, 10)).toThrow('Page must be greater than or equal to 1')
  })

  it('should throw an error for page size less than 1', () => {
    expect(() => paginate([1, 2, 3], 1, 0)).toThrow('Page size must be greater than or equal to 1')
    expect(() => paginate([1, 2, 3], 1, -1)).toThrow('Page size must be greater than or equal to 1')
  })

  it('should correctly report hasNext on last page without remainder', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = paginate(items, 2, 3)
    expect(result.data).toEqual([4, 5, 6])
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(false)
  })
})
