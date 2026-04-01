import { describe, it, expect } from 'vitest'
import { CircularBuffer } from './circular-buffer'

describe('CircularBuffer', () => {
  describe('add / get', () => {
    it('adds and retrieves a single item', () => {
      const cb = new CircularBuffer<number>(3)
      cb.add(1)
      expect(cb.get()).toEqual([1])
    })

    it('retrieves items in FIFO order', () => {
      const cb = new CircularBuffer<number>(3)
      cb.add(1)
      cb.add(2)
      cb.add(3)
      expect(cb.get()).toEqual([1, 2, 3])
    })

    it('overwrites oldest item when full', () => {
      const cb = new CircularBuffer<number>(3)
      cb.add(1)
      cb.add(2)
      cb.add(3)
      cb.add(4)
      expect(cb.get()).toEqual([2, 3, 4])
    })
  })

  describe('size', () => {
    it('returns 0 for empty buffer', () => {
      expect(new CircularBuffer<string>(5).size()).toBe(0)
    })

    it('returns count of items added', () => {
      const cb = new CircularBuffer<number>(3)
      cb.add(1)
      cb.add(2)
      expect(cb.size()).toBe(2)
    })

    it('does not exceed capacity', () => {
      const cb = new CircularBuffer<number>(2)
      cb.add(1)
      cb.add(2)
      cb.add(3)
      expect(cb.size()).toBe(2)
    })
  })

  describe('get', () => {
    it('returns empty array for empty buffer', () => {
      expect(new CircularBuffer<number>(5).get()).toEqual([])
    })

    it('wraps around correctly at capacity', () => {
      const cb = new CircularBuffer<number>(4)
      cb.add(1)
      cb.add(2)
      cb.add(3)
      cb.add(4)
      cb.add(5)
      cb.add(6)
      expect(cb.get()).toEqual([3, 4, 5, 6])
    })
  })

  describe('capacity', () => {
    it('throws when capacity is not positive', () => {
      expect(() => new CircularBuffer<number>(0)).toThrow(/positive/i)
      expect(() => new CircularBuffer<number>(-1)).toThrow(/positive/i)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const cb = new CircularBuffer<string>(2)
      cb.add('hello')
      cb.add('world')
      expect(cb.get()).toEqual(['hello', 'world'])
    })

    it('works with objects', () => {
      const cb = new CircularBuffer<{ id: number }>(2)
      cb.add({ id: 1 })
      cb.add({ id: 2 })
      expect(cb.get()).toEqual([{ id: 1 }, { id: 2 }])
    })
  })
})
