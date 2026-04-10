import { describe, it, expect } from 'vitest'
import { paginate } from './pagination'

describe('paginate', () => {
  describe('basic pagination', () => {
    it('returns correct slice for page 1 of 2', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = paginate(items, 1, 5)

      expect(result.data).toEqual([1, 2, 3, 4, 5])
      expect(result.total).toBe(10)
      expect(result.pages).toBe(2)
      expect(result.hasNext).toBe(true)
    })

    it('returns correct slice for page 2 of 2', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = paginate(items, 2, 5)

      expect(result.data).toEqual([6, 7, 8, 9, 10])
      expect(result.total).toBe(10)
      expect(result.pages).toBe(2)
      expect(result.hasNext).toBe(false)
    })

    it('handles page in the middle of multiple pages', () => {
      const items = Array.from({ length: 25 }, (_, i) => i + 1)
      const result = paginate(items, 3, 5)

      expect(result.data).toEqual([11, 12, 13, 14, 15])
      expect(result.total).toBe(25)
      expect(result.pages).toBe(5)
      expect(result.hasNext).toBe(true)
    })
  })

  describe('empty arrays', () => {
    it('returns empty data array for empty input', () => {
      const result = paginate([], 1, 10)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.pages).toBe(0)
      expect(result.hasNext).toBe(false)
    })
  })

  describe('single item', () => {
    it('handles single item array', () => {
      const result = paginate([42], 1, 10)

      expect(result.data).toEqual([42])
      expect(result.total).toBe(1)
      expect(result.pages).toBe(1)
      expect(result.hasNext).toBe(false)
    })
  })

  describe('remainder pages', () => {
    it('handles partial last page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7]
      const result = paginate(items, 2, 5)

      expect(result.data).toEqual([6, 7])
      expect(result.total).toBe(7)
      expect(result.pages).toBe(2)
      expect(result.hasNext).toBe(false)
    })

    it('handles remainder of 1', () => {
      const items = Array.from({ length: 11 }, (_, i) => i + 1)
      const result = paginate(items, 2, 10)

      expect(result.data).toEqual([11])
      expect(result.total).toBe(11)
      expect(result.pages).toBe(2)
      expect(result.hasNext).toBe(false)
    })
  })

  describe('page bounds', () => {
    it('returns empty data when page exceeds total pages', () => {
      const items = [1, 2, 3, 4, 5]
      const result = paginate(items, 10, 5)

      expect(result.data).toEqual([])
      expect(result.total).toBe(5)
      expect(result.pages).toBe(1)
      expect(result.hasNext).toBe(false)
    })

    it('handles page 1 with exact fit', () => {
      const items = [1, 2, 3]
      const result = paginate(items, 1, 3)

      expect(result.data).toEqual([1, 2, 3])
      expect(result.total).toBe(3)
      expect(result.pages).toBe(1)
      expect(result.hasNext).toBe(false)
    })
  })

  describe('invalid inputs', () => {
    it('throws error when page is less than 1', () => {
      const items = [1, 2, 3]
      expect(() => paginate(items, 0, 10)).toThrow('Page must be greater than 0')
      expect(() => paginate(items, -1, 10)).toThrow('Page must be greater than 0')
    })

    it('throws error when pageSize is less than 1', () => {
      const items = [1, 2, 3]
      expect(() => paginate(items, 1, 0)).toThrow('PageSize must be greater than 0')
      expect(() => paginate(items, 1, -5)).toThrow('PageSize must be greater than 0')
    })
  })

  describe('generic type handling', () => {
    it('works with strings', () => {
      const items = ['a', 'b', 'c', 'd', 'e']
      const result = paginate(items, 1, 2)

      expect(result.data).toEqual(['a', 'b'])
      expect(result.total).toBe(5)
      expect(result.pages).toBe(3)
      expect(result.hasNext).toBe(true)
    })

    it('works with objects', () => {
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

    it('works with mixed type arrays', () => {
      const items: (string | number | boolean)[] = [1, 'two', true, 4, false]
      const result = paginate(items, 1, 3)

      expect(result.data).toEqual([1, 'two', true])
      expect(result.total).toBe(5)
      expect(result.pages).toBe(2)
      expect(result.hasNext).toBe(true)
    })

    it('preserves object reference identity', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const items = [obj1, obj2, obj1]
      const result = paginate(items, 1, 3)

      expect(result.data[0]).toBe(obj1)
      expect(result.data[1]).toBe(obj2)
      expect(result.data[2]).toBe(obj1)
    })
  })
})
