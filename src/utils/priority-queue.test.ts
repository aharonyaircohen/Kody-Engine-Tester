import { describe, it, expect } from 'vitest'
import { PriorityQueue } from './priority-queue'

describe('PriorityQueue', () => {
  describe('enqueue', () => {
    it('enqueues a single item', () => {
      const q = PriorityQueue.empty<number>()
      const newQ = q.enqueue(1, 5)
      expect(newQ.peek()).toEqual({ value: 1, priority: 5 })
    })

    it('enqueue returns a new queue (immutable)', () => {
      const q = PriorityQueue.empty<number>()
      const newQ = q.enqueue(1, 5)
      expect(q.isEmpty()).toBe(true)
      expect(newQ.size()).toBe(1)
    })

    it('enqueues multiple items', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 3)
      q = q.enqueue(2, 1)
      q = q.enqueue(3, 2)
      expect(q.size()).toBe(3)
    })
  })

  describe('dequeue', () => {
    it('dequeues the highest priority item first', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 3)
      q = q.enqueue(2, 1)
      q = q.enqueue(3, 2)

      const [item1, q1] = q.dequeue()
      expect(item1).toEqual({ value: 2, priority: 1 })

      const [item2, q2] = q1.dequeue()
      expect(item2).toEqual({ value: 3, priority: 2 })

      const [item3, q3] = q2.dequeue()
      expect(item3).toEqual({ value: 1, priority: 3 })

      expect(q3.isEmpty()).toBe(true)
    })

    it('throws when dequeuing from empty queue', () => {
      const q = PriorityQueue.empty<number>()
      expect(() => q.dequeue()).toThrow(/empty/i)
    })

    it('dequeue preserves original queue', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 1)
      q = q.enqueue(2, 2)

      q.dequeue()
      expect(q.size()).toBe(2)
    })

    it('handles duplicate priorities (FIFO for equal priority)', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 1)
      q = q.enqueue(2, 1)
      q = q.enqueue(3, 2)

      const [item1, q1] = q.dequeue()
      expect(item1.value).toBe(1)

      const [item2, q2] = q1.dequeue()
      expect(item2.value).toBe(2)
    })
  })

  describe('peek', () => {
    it('returns the highest priority item without removing it', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 3)
      q = q.enqueue(2, 1)
      q = q.enqueue(3, 2)

      expect(q.peek()).toEqual({ value: 2, priority: 1 })
      expect(q.size()).toBe(3)
    })

    it('throws when peeking empty queue', () => {
      const q = PriorityQueue.empty<number>()
      expect(() => q.peek()).toThrow(/empty/i)
    })
  })

  describe('isEmpty', () => {
    it('returns true on new queue', () => {
      expect(PriorityQueue.empty<number>().isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = PriorityQueue.empty<number>().enqueue(1, 1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all items dequeued', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 1)
      const [, newQ] = q.dequeue()
      expect(newQ.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      expect(PriorityQueue.empty<number>().size()).toBe(0)
    })

    it('returns correct size after enqueues', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 1)
      q = q.enqueue(2, 2)
      expect(q.size()).toBe(2)
    })

    it('decrements after dequeue', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 1)
      q = q.enqueue(2, 2)
      const [, newQ] = q.dequeue()
      expect(newQ.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      expect(PriorityQueue.empty<number>().toArray()).toEqual([])
    })

    it('returns all items', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 2)
      q = q.enqueue(2, 1)
      expect(q.toArray()).toHaveLength(2)
    })

    it('returns a copy unaffected by mutations', () => {
      let q = PriorityQueue.empty<number>()
      q = q.enqueue(1, 1)
      const arr = q.toArray()
      arr.push({ value: 99, priority: 99 })
      expect(q.size()).toBe(1)
    })
  })

  describe('PriorityQueue.from', () => {
    it('creates queue from array of items', () => {
      const q = PriorityQueue.from([
        { value: 1, priority: 3 },
        { value: 2, priority: 1 },
        { value: 3, priority: 2 },
      ])

      expect(q.peek()).toEqual({ value: 2, priority: 1 })
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      let q = PriorityQueue.empty<string>()
      q = q.enqueue('hello', 1)
      q = q.enqueue('world', 0)

      const [item] = q.dequeue()
      expect(item.value).toBe('world')
    })

    it('works with objects', () => {
      let q = PriorityQueue.empty<{ id: number }>()
      q = q.enqueue({ id: 42 }, 1)
      q = q.enqueue({ id: 1 }, 0)

      const [item] = q.dequeue()
      expect(item.value).toEqual({ id: 1 })
    })
  })
})
