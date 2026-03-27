import { describe, it, expect } from 'vitest'
import { Queue } from './queue'

describe('Queue', () => {
  describe('enqueue / dequeue', () => {
    it('enqueues and dequeues a single item', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      expect(q.dequeue()).toBe(1)
    })

    it('dequeues in FIFO order', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.dequeue()).toBe(1)
      expect(q.dequeue()).toBe(2)
      expect(q.dequeue()).toBe(3)
    })

    it('throws when dequeuing from empty queue', () => {
      const q = new Queue<number>()
      expect(() => q.dequeue()).toThrow(/empty/i)
    })

    it('throws after all items are dequeued', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(() => q.dequeue()).toThrow(/empty/i)
    })
  })

  describe('front', () => {
    it('returns front item without removing it', () => {
      const q = new Queue<string>()
      q.enqueue('a')
      q.enqueue('b')
      expect(q.front()).toBe('a')
      expect(q.size()).toBe(2)
    })

    it('throws when peeking empty queue', () => {
      const q = new Queue<number>()
      expect(() => q.front()).toThrow(/empty/i)
    })
  })

  describe('isEmpty', () => {
    it('returns true on new queue', () => {
      expect(new Queue().isEmpty()).toBe(true)
    })

    it('returns false after enqueue', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all items dequeued', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      q.dequeue()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      expect(new Queue().size()).toBe(0)
    })

    it('tracks size as items are enqueued and dequeued', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size()).toBe(2)
      q.dequeue()
      expect(q.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      expect(new Queue().toArray()).toEqual([])
    })

    it('returns items in front-to-back order', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy — mutations do not affect the queue', () => {
      const q = new Queue<number>()
      q.enqueue(1)
      const arr = q.toArray()
      arr.push(99)
      expect(q.size()).toBe(1)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const q = new Queue<string>()
      q.enqueue('hello')
      expect(q.dequeue()).toBe('hello')
    })

    it('works with objects', () => {
      const q = new Queue<{ id: number }>()
      q.enqueue({ id: 42 })
      expect(q.dequeue()).toEqual({ id: 42 })
    })
  })
})
