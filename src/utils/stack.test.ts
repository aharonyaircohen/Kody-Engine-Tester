import { describe, it, expect } from 'vitest'
import { Stack } from './stack'

describe('Stack', () => {
  describe('push / pop', () => {
    it('pushes and pops a single item', () => {
      const s = new Stack<number>()
      s.push(1)
      expect(s.pop()).toBe(1)
    })

    it('pops in LIFO order', () => {
      const s = new Stack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.pop()).toBe(3)
      expect(s.pop()).toBe(2)
      expect(s.pop()).toBe(1)
    })

    it('throws when popping from empty stack', () => {
      const s = new Stack<number>()
      expect(() => s.pop()).toThrow(/empty/i)
    })

    it('throws after all items are popped', () => {
      const s = new Stack<number>()
      s.push(1)
      s.pop()
      expect(() => s.pop()).toThrow(/empty/i)
    })
  })

  describe('peek', () => {
    it('returns top item without removing it', () => {
      const s = new Stack<string>()
      s.push('a')
      s.push('b')
      expect(s.peek()).toBe('b')
      expect(s.size()).toBe(2)
    })

    it('throws when peeking empty stack', () => {
      const s = new Stack<number>()
      expect(() => s.peek()).toThrow(/empty/i)
    })
  })

  describe('isEmpty', () => {
    it('returns true on new stack', () => {
      expect(new Stack().isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const s = new Stack<number>()
      s.push(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after all items popped', () => {
      const s = new Stack<number>()
      s.push(1)
      s.pop()
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty stack', () => {
      expect(new Stack().size()).toBe(0)
    })

    it('tracks size as items are pushed and popped', () => {
      const s = new Stack<number>()
      s.push(1)
      s.push(2)
      expect(s.size()).toBe(2)
      s.pop()
      expect(s.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty stack', () => {
      expect(new Stack().toArray()).toEqual([])
    })

    it('returns items in bottom-to-top order', () => {
      const s = new Stack<number>()
      s.push(1)
      s.push(2)
      s.push(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('returns a copy — mutations do not affect the stack', () => {
      const s = new Stack<number>()
      s.push(1)
      const arr = s.toArray()
      arr.push(99)
      expect(s.size()).toBe(1)
    })
  })

  describe('generics', () => {
    it('works with strings', () => {
      const s = new Stack<string>()
      s.push('hello')
      expect(s.pop()).toBe('hello')
    })

    it('works with objects', () => {
      const s = new Stack<{ id: number }>()
      const obj = { id: 42 }
      s.push(obj)
      expect(s.pop()).toEqual({ id: 42 })
    })
  })
})
