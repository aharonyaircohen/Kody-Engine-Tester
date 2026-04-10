import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives
  it('should return target when source is empty', () => {
    const target = { a: 1, b: 2 }
    const source = {}
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 2 })
  })

  it('should return new object without mutating target', () => {
    const target = { a: 1, b: 2 }
    const source = { c: 3 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
    expect(target).toEqual({ a: 1, b: 2 })
    expect(result).not.toBe(target)
  })

  it('should overwrite primitive values in target with source', () => {
    const target = { a: 1, b: 'hello', c: true }
    const source = { a: 2, b: 'world', c: false }
    expect(deepMerge(target, source)).toEqual({ a: 2, b: 'world', c: false })
  })

  it('should handle source null values', () => {
    const target = { a: 1, b: 2 }
    const source = { a: null }
    expect(deepMerge(target, source)).toEqual({ a: null, b: 2 })
  })

  it('should handle source undefined values', () => {
    const target = { a: 1, b: 2 }
    const source = { a: undefined }
    expect(deepMerge(target, source)).toEqual({ a: undefined, b: 2 })
  })

  // Nested objects
  it('should recursively merge nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    expect(deepMerge(target, source)).toEqual({ a: { b: { c: 1, d: 2 } } })
  })

  it('should not mutate nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = deepMerge(target, source)
    expect(target.a.b).toEqual({ c: 1 })
    expect(result.a.b).toEqual({ c: 1, d: 2 })
    expect(result.a.b).not.toBe(target.a.b)
  })

  it('should handle deeply nested structures', () => {
    const target = { a: { b: { c: { d: { e: 1 } } } } }
    const source = { a: { b: { c: { d: { f: 2 } } } } }
    expect(deepMerge(target, source)).toEqual({
      a: { b: { c: { d: { e: 1, f: 2 } } } },
    })
  })

  it('should merge nested objects when target has more nesting', () => {
    const target = { a: { b: { c: 1, extra: 'keep' } } }
    const source = { a: { b: { d: 2 } } }
    expect(deepMerge(target, source)).toEqual({
      a: { b: { c: 1, extra: 'keep', d: 2 } },
    })
  })

  // Arrays
  it('should replace arrays rather than concatenating', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    expect(deepMerge(target, source)).toEqual({ a: [4, 5] })
  })

  it('should not mutate arrays', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    const result = deepMerge(target, source)
    expect(target.a).toEqual([1, 2, 3])
    expect(result.a).not.toBe(target.a)
  })

  it('should handle empty arrays in source replacing non-empty arrays in target', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [] }
    expect(deepMerge(target, source)).toEqual({ a: [] })
  })

  it('should handle arrays containing objects', () => {
    const target = { a: [{ b: 1 }] }
    const source = { a: [{ c: 2 }] }
    expect(deepMerge(target, source)).toEqual({ a: [{ c: 2 }] })
  })

  // Mixed types
  it('should handle mixed primitive and object values', () => {
    const target = { a: 1, b: { c: 2 }, d: [1, 2] }
    const source = { a: 10, b: { d: 3 }, e: 'new' }
    expect(deepMerge(target, source)).toEqual({
      a: 10,
      b: { c: 2, d: 3 },
      d: [1, 2],
      e: 'new',
    })
  })

  it('should handle source adding new keys to target', () => {
    const target = { existing: 1 }
    const source = { newKey: { nested: 'value' } }
    expect(deepMerge(target, source)).toEqual({
      existing: 1,
      newKey: { nested: 'value' },
    })
  })

  // Edge cases
  it('should handle empty target and source', () => {
    const target = {}
    const source = {}
    expect(deepMerge(target, source)).toEqual({})
  })

  it('should handle empty object source on non-empty target', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = {}
    expect(deepMerge(target, source)).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should handle non-empty object target and empty source', () => {
    const target = {}
    const source = { a: 1, b: { c: 2 } }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should preserve target-only keys not in source', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 10, c: 3 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 10, c: 3 })
  })

  it('should handle boolean values', () => {
    const target = { a: true, b: false }
    const source = { a: false, b: true }
    expect(deepMerge(target, source)).toEqual({ a: false, b: true })
  })

  it('should handle zero values correctly', () => {
    const target = { a: 0, b: 1 }
    const source = { a: 5, c: 0 }
    expect(deepMerge(target, source)).toEqual({ a: 5, b: 1, c: 0 })
  })

  it('should handle empty string values correctly', () => {
    const target = { a: 'hello', b: 'world' }
    const source = { a: '', c: 'new' }
    expect(deepMerge(target, source)).toEqual({ a: '', b: 'world', c: 'new' })
  })

  it('should handle objects where source is primitive but target is object', () => {
    const target = { a: { b: 1 } }
    const source = { a: 'replaced' }
    expect(deepMerge(target, source)).toEqual({ a: 'replaced' })
  })

  it('should handle Date objects in target', () => {
    const date = new Date('2024-01-01')
    const target = { a: date }
    const source = { b: 1 }
    const result = deepMerge(target, source)
    expect(result.a).toEqual(date)
  })

  it('should merge objects with array at different levels', () => {
    const target = { a: { arr: [1, 2] }, b: 1 }
    const source = { a: { arr: [3], str: 'new' }, b: { c: 2 } }
    expect(deepMerge(target, source)).toEqual({
      a: { arr: [3], str: 'new' },
      b: { c: 2 },
    })
  })

  it('should handle source with only null value at nested level', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: null } }
    expect(deepMerge(target, source)).toEqual({ a: { b: null } })
  })
})
