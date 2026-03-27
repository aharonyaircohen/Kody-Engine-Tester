import { describe, it, expect } from 'vitest'
import { SortedArray } from './sorted-array'

// Custom object type for comparator tests
interface Person {
  name: string
  age: number
}

const personCompare = (a: Person, b: Person): number => a.age - b.age

describe('SortedArray', () => {
  describe('insert', () => {
    it('inserts a single element', () => {
      const s = new SortedArray<number>()
      s.insert(5)
      expect(s.toArray()).toEqual([5])
    })

    it('keeps elements sorted after multiple inserts', () => {
      const s = new SortedArray<number>()
      s.insert(3)
      s.insert(1)
      s.insert(4)
      s.insert(1)
      s.insert(5)
      expect(s.toArray()).toEqual([1, 1, 3, 4, 5])
    })

    it('inserts in reverse order', () => {
      const s = new SortedArray<number>()
      s.insert(5)
      s.insert(4)
      s.insert(3)
      s.insert(2)
      s.insert(1)
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts in already-sorted order', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.insert(3)
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('inserts strings in alphabetical order', () => {
      const s = new SortedArray<string>()
      s.insert('banana')
      s.insert('apple')
      s.insert('cherry')
      expect(s.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  describe('has', () => {
    it('returns true for existing element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.insert(3)
      expect(s.has(2)).toBe(true)
    })

    it('returns false for missing element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(3)
      expect(s.has(2)).toBe(false)
    })

    it('returns false on empty array', () => {
      const s = new SortedArray<number>()
      expect(s.has(1)).toBe(false)
    })

    it('returns true for duplicate elements', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(1)
      expect(s.has(1)).toBe(true)
    })
  })

  describe('indexOf', () => {
    it('returns correct index for existing element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(3)
      s.insert(5)
      expect(s.indexOf(3)).toBe(1)
    })

    it('returns -1 for missing element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(5)
      expect(s.indexOf(3)).toBe(-1)
    })

    it('returns -1 on empty array', () => {
      const s = new SortedArray<number>()
      expect(s.indexOf(1)).toBe(-1)
    })

    it('returns index of first occurrence of duplicate', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(1)
      s.insert(2)
      expect(s.indexOf(1)).toBe(0)
    })
  })

  describe('remove', () => {
    it('removes an existing element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.insert(3)
      const result = s.remove(2)
      expect(result).toBe(true)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('returns false when removing missing element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(3)
      const result = s.remove(2)
      expect(result).toBe(false)
      expect(s.toArray()).toEqual([1, 3])
    })

    it('removes only the first occurrence of a duplicate', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(1)
      s.insert(2)
      s.remove(1)
      expect(s.toArray()).toEqual([1, 2])
    })

    it('removes last element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.remove(2)
      expect(s.toArray()).toEqual([1])
    })

    it('removes first element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.remove(1)
      expect(s.toArray()).toEqual([2])
    })

    it('returns false on empty array', () => {
      const s = new SortedArray<number>()
      expect(s.remove(1)).toBe(false)
    })
  })

  describe('range', () => {
    it('returns elements within range', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.insert(3)
      s.insert(4)
      s.insert(5)
      expect(s.range(2, 4)).toEqual([2, 3, 4])
    })

    it('returns empty array when no elements in range', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(10)
      expect(s.range(2, 5)).toEqual([])
    })

    it('returns all elements when range covers entire array', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.insert(3)
      expect(s.range(1, 3)).toEqual([1, 2, 3])
    })

    it('returns elements at exact boundaries', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.insert(3)
      expect(s.range(1, 1)).toEqual([1])
    })

    it('handles single element array', () => {
      const s = new SortedArray<number>()
      s.insert(5)
      expect(s.range(3, 7)).toEqual([5])
      expect(s.range(6, 10)).toEqual([])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty SortedArray', () => {
      expect(new SortedArray<number>().toArray()).toEqual([])
    })

    it('returns a copy that is unaffected by mutations', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      const arr = s.toArray()
      arr.push(99)
      expect(s.toArray()).toEqual([1, 2])
    })
  })

  describe('size', () => {
    it('returns 0 for empty array', () => {
      expect(new SortedArray<number>().size()).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      expect(s.size()).toBe(2)
    })

    it('decrements after remove', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.insert(2)
      s.remove(1)
      expect(s.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty array', () => {
      expect(new SortedArray<number>().isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      expect(s.isEmpty()).toBe(false)
    })

    it('returns true after removing last element', () => {
      const s = new SortedArray<number>()
      s.insert(1)
      s.remove(1)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('iterator', () => {
    it('supports for...of loop', () => {
      const s = new SortedArray<number>()
      s.insert(3)
      s.insert(1)
      s.insert(2)
      const result: number[] = []
      for (const item of s) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('iterates over empty array', () => {
      const s = new SortedArray<number>()
      const result: number[] = []
      for (const item of s) {
        result.push(item)
      }
      expect(result).toEqual([])
    })
  })

  describe('with custom comparator', () => {
    it('sorts by custom comparator', () => {
      const s = new SortedArray<Person>(personCompare)
      s.insert({ name: 'Alice', age: 30 })
      s.insert({ name: 'Bob', age: 20 })
      s.insert({ name: 'Carol', age: 25 })
      expect(s.toArray()).toEqual([
        { name: 'Bob', age: 20 },
        { name: 'Carol', age: 25 },
        { name: 'Alice', age: 30 },
      ])
    })

    it('has and indexOf work with custom comparator', () => {
      const s = new SortedArray<Person>(personCompare)
      s.insert({ name: 'Alice', age: 30 })
      s.insert({ name: 'Bob', age: 20 })
      expect(s.has({ name: 'Different', age: 20 })).toBe(true)
      expect(s.indexOf({ name: 'Different', age: 20 })).toBe(0)
    })

    it('range works with custom comparator', () => {
      const s = new SortedArray<Person>(personCompare)
      s.insert({ name: 'Alice', age: 30 })
      s.insert({ name: 'Bob', age: 20 })
      s.insert({ name: 'Carol', age: 25 })
      const min: Person = { name: '', age: 22 }
      const max: Person = { name: '', age: 28 }
      expect(s.range(min, max)).toEqual([{ name: 'Carol', age: 25 }])
    })

    it('remove works with custom comparator', () => {
      const s = new SortedArray<Person>(personCompare)
      s.insert({ name: 'Alice', age: 30 })
      s.insert({ name: 'Bob', age: 20 })
      const removed = s.remove({ name: 'Bob', age: 20 })
      expect(removed).toBe(true)
      expect(s.size()).toBe(1)
      expect(s.toArray()[0].name).toBe('Alice')
    })
  })

  describe('with string elements (natural order)', () => {
    it('inserts strings in alphabetical order', () => {
      const s = new SortedArray<string>()
      s.insert('zebra')
      s.insert('apple')
      s.insert('mango')
      expect(s.toArray()).toEqual(['apple', 'mango', 'zebra'])
    })

    it('has returns true for existing strings', () => {
      const s = new SortedArray<string>()
      s.insert('apple')
      s.insert('banana')
      expect(s.has('banana')).toBe(true)
      expect(s.has('cherry')).toBe(false)
    })
  })
})
