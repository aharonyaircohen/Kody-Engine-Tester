import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives
  it('should return target when source is null', () => {
    const target = { a: 1 }
    const result = deepMerge(target, { a: null } as never)
    expect(result).toEqual({ a: null })
  })

  it('should return target when source is undefined', () => {
    const target = { a: 1 }
    const result = deepMerge(target, { a: undefined } as never)
    expect(result).toEqual({ a: undefined })
  })

  it('should override primitive values', () => {
    const target = { a: 1, b: 'old' }
    const source = { a: 2, b: 'new' }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 2, b: 'new' })
  })

  // Plain objects
  it('should merge nested objects recursively', () => {
    const target = { a: 1, b: { c: 2, d: 3 } }
    const source = { b: { c: 10, e: 5 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { c: 10, d: 3, e: 5 } })
  })

  it('should not mutate target', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { c: 10 } }
    deepMerge(target, source)
    expect(target).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should not mutate source', () => {
    const target = { a: 1 }
    const source = { b: { c: 2 } }
    deepMerge(target, source)
    expect(source).toEqual({ b: { c: 2 } })
  })

  it('should return a new object', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = deepMerge(target, source)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  it('should merge empty objects', () => {
    const target = {}
    const source = { a: 1 }
    expect(deepMerge(target, source)).toEqual({ a: 1 })
  })

  it('should return target when source is empty', () => {
    const target = { a: 1 }
    const source = {}
    expect(deepMerge(target, source)).toEqual({ a: 1 })
  })

  // Arrays
  it('should replace arrays instead of merging', () => {
    const target = { arr: [1, 2, 3] }
    const source = { arr: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ arr: [4, 5] })
  })

  it('should clone array values', () => {
    const target = { arr: [1, 2] }
    const source = { arr: [3, 4] }
    const result = deepMerge(target, source)
    expect(result.arr).not.toBe(target.arr)
    expect(result.arr).not.toBe(source.arr)
  })

  // Date
  it('should replace Date with source Date', () => {
    const target = { date: new Date('2024-01-01') }
    const source = { date: new Date('2024-06-01') }
    const result = deepMerge(target, source)
    expect(result.date).toEqual(new Date('2024-06-01'))
    expect(result.date).not.toBe(target.date)
    expect(result.date).not.toBe(source.date)
  })

  // RegExp
  it('should replace RegExp with source RegExp', () => {
    const target = { pattern: /foo/g }
    const source = { pattern: /bar/i }
    const result = deepMerge(target, source)
    expect(result.pattern.source).toBe('bar')
    expect(result.pattern.flags).toBe('i')
    expect(result.pattern).not.toBe(target.pattern)
    expect(result.pattern).not.toBe(source.pattern)
  })

  // Map
  it('should replace Map with source Map', () => {
    const target = { map: new Map([['a', 1]]) }
    const source = { map: new Map([['b', 2]]) }
    const result = deepMerge(target, source)
    expect(result.map).toEqual(new Map([['b', 2]]))
    expect(result.map).not.toBe(target.map)
    expect(result.map).not.toBe(source.map)
  })

  // Set
  it('should replace Set with source Set', () => {
    const target = { set: new Set([1, 2]) }
    const source = { set: new Set([3, 4]) }
    const result = deepMerge(target, source)
    expect(result.set).toEqual(new Set([3, 4]))
    expect(result.set).not.toBe(target.set)
    expect(result.set).not.toBe(source.set)
  })

  // Nested combinations
  it('should handle deeply nested structures', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: [1, 2],
        meta: { created: new Date('2024-01-01') },
      },
    }
    const source = {
      b: {
        c: 20,
        d: [3],
        meta: { updated: new Date('2024-06-01') },
      },
    }
    const result = deepMerge(target, source)
    // Deep merge keeps target's 'created' and adds source's 'updated'
    expect(result.a).toBe(1)
    expect(result.b.c).toBe(20)
    expect(result.b.d).toEqual([3])
    expect(result.b.meta.updated).toEqual(new Date('2024-06-01'))
    expect(result.b.meta.created).toEqual(new Date('2024-01-01'))
    expect(result.b.d).not.toBe(target.b.d)
    expect(result.b.meta).not.toBe(target.b.meta)
  })

  it('should handle adding new properties', () => {
    const target = { existing: 1 }
    const source = { new: { nested: 2 }, another: 3 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ existing: 1, new: { nested: 2 }, another: 3 })
  })

  it('should handle removing properties by overriding with undefined', () => {
    const target = { a: 1, b: 2 }
    const source = { a: undefined } as never
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: undefined, b: 2 })
  })
})