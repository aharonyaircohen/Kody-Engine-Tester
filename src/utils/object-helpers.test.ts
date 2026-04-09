import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Basic merge
  it('should merge two flat objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should not mutate the target object', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3 }
    deepMerge(target, source)
    expect(target).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate the source object', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    deepMerge(target, source)
    expect(source).toEqual({ b: 2 })
  })

  it('should return a new object', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = deepMerge(target, source)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  // Nested objects
  it('should recursively merge nested objects', () => {
    const target = { a: { nested: 1 }, b: 2 }
    const source = { a: { another: 3 }, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { nested: 1, another: 3 }, b: 2, c: 4 })
  })

  it('should handle deeply nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } })
  })

  // Null and undefined handling
  it('should skip null values in source', () => {
    const target = { a: 1, b: 2 }
    const source = { a: null, c: 3 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should skip undefined values in source', () => {
    const target = { a: 1, b: 2 }
    const source = { a: undefined, c: 3 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should preserve target values when source has null/undefined', () => {
    const target = { a: 1 }
    const source = { a: null, b: undefined }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1 })
  })

  // Arrays
  it('should replace arrays from source', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [4, 5] })
  })

  it('should handle nested objects with arrays', () => {
    const target = { a: { arr: [1, 2] }, b: 2 }
    const source = { a: { arr: [3] } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { arr: [3] }, b: 2 })
  })

  // Primitive types
  it('should handle primitive source values overriding objects', () => {
    const target = { a: { nested: 1 } }
    const source = { a: 'string' }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 'string' })
  })

  it('should handle empty objects', () => {
    expect(deepMerge({}, {})).toEqual({})
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 })
    expect(deepMerge({}, { b: 2 })).toEqual({ b: 2 })
  })

  // Mixed types
  it('should handle mixed primitive and object values', () => {
    const target = { a: 1, b: { nested: 2 }, c: [1, 2] }
    const source = { a: 10, b: { nested: 20, extra: 30 }, d: 'new' }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 10, b: { nested: 20, extra: 30 }, c: [1, 2], d: 'new' })
  })

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01')
    const target = { a: { date } }
    const source = { a: { value: 42 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { date, value: 42 } })
  })

  it('should replace target object with Date in source', () => {
    const date = new Date('2024-01-01')
    const target = { a: { nested: 1 } }
    const source = { a: date }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: date })
  })
})