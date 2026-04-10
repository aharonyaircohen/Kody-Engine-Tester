import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives
  it('should return target as-is when source is empty', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, {})
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate the target object', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { d: 3 } }
    deepMerge(target, source)
    expect(target).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should not mutate the source object', () => {
    const target = { a: 1 }
    const source = { b: { c: 3 } }
    deepMerge(target, source)
    expect(source).toEqual({ b: { c: 3 } })
  })

  it('should overwrite primitive values', () => {
    const result = deepMerge({ a: 1, b: 2 }, { a: 10 })
    expect(result).toEqual({ a: 10, b: 2 })
  })

  it('should handle null source value', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: null })
    expect(result).toEqual({ a: 1, b: null })
  })

  it('should handle undefined source value', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: undefined })
    expect(result).toEqual({ a: 1, b: undefined })
  })

  // Plain objects
  it('should deep merge nested objects', () => {
    const result = deepMerge(
      { a: 1, b: { c: 2, e: 4 } },
      { b: { c: 3, d: 4 } }
    )
    expect(result).toEqual({ a: 1, b: { c: 3, d: 4, e: 4 } })
  })

  it('should handle deeply nested objects', () => {
    const result = deepMerge(
      { a: { b: { c: { d: 1 } } } },
      { a: { b: { c: { e: 2 } } } }
    )
    expect(result).toEqual({ a: { b: { c: { d: 1, e: 2 } } } })
  })

  it('should add new keys from source', () => {
    const result = deepMerge({ a: 1 }, { b: 2 })
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should handle empty target', () => {
    const result = deepMerge({}, { a: 1, b: { c: 2 } })
    expect(result).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should handle empty source', () => {
    const target = { a: 1, b: { c: 2 } }
    const result = deepMerge(target, {})
    expect(result).toEqual({ a: 1, b: { c: 2 } })
    expect(result).not.toBe(target)
  })

  // Arrays
  it('should replace arrays in source', () => {
    const result = deepMerge({ a: [1, 2, 3] }, { a: [4, 5] })
    expect(result).toEqual({ a: [4, 5] })
  })

  it('should replace nested arrays', () => {
    const result = deepMerge(
      { a: { b: [1, 2] } },
      { a: { b: [3, 4, 5] } }
    )
    expect(result).toEqual({ a: { b: [3, 4, 5] } })
  })

  it('should create new array reference', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    const result = deepMerge(target, source)
    expect(result.a).not.toBe(target.a)
    expect(result.a).not.toBe(source.a)
  })

  // Mixed
  it('should handle mixed primitive and object values', () => {
    const result = deepMerge(
      { a: 1, b: { c: 2 }, d: [1, 2] },
      { a: 10, b: { d: 4 }, d: [3, 4] }
    )
    expect(result).toEqual({ a: 10, b: { c: 2, d: 4 }, d: [3, 4] })
  })

  it('should handle null values in nested objects', () => {
    const result = deepMerge(
      { a: { b: 1 } },
      { a: { b: null } }
    )
    expect(result).toEqual({ a: { b: null } })
  })

  it('should handle undefined values in nested objects', () => {
    const result = deepMerge(
      { a: { b: 1, c: 2 } },
      { a: { b: undefined } }
    )
    expect(result).toEqual({ a: { b: undefined, c: 2 } })
  })

  it('should handle source nested object becoming primitive', () => {
    const result = deepMerge(
      { a: { b: 1 } },
      { a: 2 } as any
    )
    expect(result).toEqual({ a: 2 })
  })

  // Complex scenarios
  it('should handle multiple levels of merging', () => {
    const result = deepMerge(
      { a: { b: { c: 1, d: 2 } }, e: 5 },
      { a: { b: { c: 10, f: 6 } }, e: { g: 7 } }
    )
    expect(result).toEqual({ a: { b: { c: 10, d: 2, f: 6 } }, e: { g: 7 } })
  })

  it('should handle Date objects', () => {
    const date = new Date('2024-01-15')
    const result = deepMerge({ a: 1 }, { a: date })
    expect(result.a).toEqual(date)
    expect(result.a).not.toBe(date)
  })

  it('should handle RegExp objects', () => {
    const re = /test/gi
    const result = deepMerge({ a: 1 }, { a: re })
    expect(result.a.source).toBe('test')
    expect(result.a.flags).toBe('gi')
    expect(result.a).not.toBe(re)
  })

  it('should handle Map objects', () => {
    const map = new Map([['key', { x: 1 }]])
    const result = deepMerge({ a: map }, { a: map })
    expect(result.a).toEqual(map)
    expect(result.a).not.toBe(map)
  })

  it('should handle Set objects', () => {
    const set = new Set([1, 2, 3])
    const result = deepMerge({ a: set }, { a: set })
    expect(result.a).toEqual(set)
    expect(result.a).not.toBe(set)
  })

  it('should preserve target-only keys not in source', () => {
    const result = deepMerge(
      { a: 1, b: 2, c: 3 },
      { a: 10 }
    )
    expect(result).toEqual({ a: 10, b: 2, c: 3 })
  })

  it('should return target with same reference when source is empty object', () => {
    const target = { a: 1 }
    const result = deepMerge(target, {})
    expect(result).toEqual(target)
    expect(result).not.toBe(target)
  })
})
