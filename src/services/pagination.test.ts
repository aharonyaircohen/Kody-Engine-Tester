import { describe, expect, it } from 'vitest'

import { paginate } from './pagination'

describe('paginate', () => {
  it('returns first page of items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = paginate(items, 1, 3)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.total).toBe(10)
    expect(result.pages).toBe(4)
    expect(result.hasNext).toBe(true)
  })

  it('returns middle page of items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = paginate(items, 2, 3)
    expect(result.data).toEqual([4, 5, 6])
    expect(result.total).toBe(10)
    expect(result.pages).toBe(4)
    expect(result.hasNext).toBe(true)
  })

  it('returns last page of items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = paginate(items, 4, 3)
    expect(result.data).toEqual([10])
    expect(result.total).toBe(10)
    expect(result.pages).toBe(4)
    expect(result.hasNext).toBe(false)
  })

  it('returns empty data when page exceeds total pages', () => {
    const items = [1, 2, 3, 4, 5]
    const result = paginate(items, 10, 3)
    expect(result.data).toEqual([])
    expect(result.total).toBe(5)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(false)
  })

  it('handles empty array', () => {
    const result = paginate([], 1, 10)
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
    expect(result.pages).toBe(0)
    expect(result.hasNext).toBe(false)
  })

  it('handles pageSize equal to total items', () => {
    const items = [1, 2, 3, 4, 5]
    const result = paginate(items, 1, 5)
    expect(result.data).toEqual([1, 2, 3, 4, 5])
    expect(result.total).toBe(5)
    expect(result.pages).toBe(1)
    expect(result.hasNext).toBe(false)
  })

  it('handles pageSize larger than total items', () => {
    const items = [1, 2, 3]
    const result = paginate(items, 1, 10)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.total).toBe(3)
    expect(result.pages).toBe(1)
    expect(result.hasNext).toBe(false)
  })

  it('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
    const result = paginate(items, 1, 2)
    expect(result.data).toEqual([{ id: 1 }, { id: 2 }])
    expect(result.total).toBe(4)
    expect(result.pages).toBe(2)
    expect(result.hasNext).toBe(true)
  })

  it('throws when page is less than 1', () => {
    expect(() => paginate([1, 2, 3], 0, 10)).toThrow('page must be at least 1')
    expect(() => paginate([1, 2, 3], -1, 10)).toThrow('page must be at least 1')
  })

  it('throws when pageSize is less than 1', () => {
    expect(() => paginate([1, 2, 3], 1, 0)).toThrow('pageSize must be at least 1')
    expect(() => paginate([1, 2, 3], 1, -1)).toThrow('pageSize must be at least 1')
  })
})
