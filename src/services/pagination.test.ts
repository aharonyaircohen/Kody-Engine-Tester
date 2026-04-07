import { describe, it, expect } from 'vitest'
import { paginate } from './pagination'

describe('paginate', () => {
  describe('basic pagination', () => {
    it('should return first page of items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = paginate(items, 1, 3)
      expect(result.data).toEqual([1, 2, 3])
      expect(result.total).toBe(10)
      expect(result.pages).toBe(4)
      expect(result.hasNext).toBe(true)
    })

    it('should return middle page of items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = paginate(items, 2, 3)
      expect(result.data).toEqual([4, 5, 6])
      expect(result.total).toBe(10)
      expect(result.pages).toBe(4)
      expect(result.hasNext).toBe(true)
    })

    it('should return last page of items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = paginate(items, 4, 3)
      expect(result.data).toEqual([10])
      expect(result.total).toBe(10)
      expect(result.pages).toBe(4)
      expect(result.hasNext).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should return empty data for empty array', () => {
      const result = paginate([], 1, 10)
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.pages).toBe(0)
      expect(result.hasNext).toBe(false)
    })

    it('should return all items when pageSize is larger than total items', () => {
      const items = [1, 2, 3]
      const result = paginate(items, 1, 10)
      expect(result.data).toEqual([1, 2, 3])
      expect(result.total).toBe(3)
      expect(result.pages).toBe(1)
      expect(result.hasNext).toBe(false)
    })

    it('should handle exact page boundary', () => {
      const items = [1, 2, 3, 4, 5, 6]
      const result = paginate(items, 2, 3)
      expect(result.data).toEqual([4, 5, 6])
      expect(result.total).toBe(6)
      expect(result.pages).toBe(2)
      expect(result.hasNext).toBe(false)
    })

    it('should handle page size of 1', () => {
      const items = ['a', 'b', 'c']
      const result = paginate(items, 2, 1)
      expect(result.data).toEqual(['b'])
      expect(result.total).toBe(3)
      expect(result.pages).toBe(3)
      expect(result.hasNext).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should throw error for page less than 1', () => {
      expect(() => paginate([1, 2, 3], 0, 10)).toThrow('Page must be greater than or equal to 1')
      expect(() => paginate([1, 2, 3], -1, 10)).toThrow('Page must be greater than or equal to 1')
    })

    it('should throw error for pageSize less than 1', () => {
      expect(() => paginate([1, 2, 3], 1, 0)).toThrow('Page size must be greater than or equal to 1')
      expect(() => paginate([1, 2, 3], 1, -1)).toThrow('Page size must be greater than or equal to 1')
    })
  })

  describe('type safety', () => {
    it('should work with different types', () => {
      const strings = ['a', 'b', 'c', 'd']
      const result = paginate(strings, 1, 2)
      expect(result.data).toEqual(['a', 'b'])
      expect(result.data[0]).toBe('a')
    })

    it('should work with objects', () => {
      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = paginate(objects, 1, 2)
      expect(result.data).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should preserve object reference', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const items = [obj1, obj2, obj2]
      const result = paginate(items, 1, 2)
      expect(result.data[0]).toBe(obj1)
    })
  })

  describe('page calculations', () => {
    it('should calculate pages correctly with remainder', () => {
      const items = [1, 2, 3, 4, 5, 6, 7]
      const result = paginate(items, 1, 3)
      expect(result.pages).toBe(3)
      expect(result.data).toHaveLength(3)
    })

    it('should handle page beyond total pages gracefully', () => {
      const items = [1, 2, 3]
      const result = paginate(items, 10, 3)
      expect(result.data).toEqual([])
      expect(result.total).toBe(3)
      expect(result.pages).toBe(1)
      expect(result.hasNext).toBe(false)
    })

    it('should handle page 1 with no remainder', () => {
      const items = [1, 2, 3, 4, 5, 6]
      const result = paginate(items, 1, 2)
      expect(result.data).toEqual([1, 2])
      expect(result.hasNext).toBe(true)
    })
  })
})
