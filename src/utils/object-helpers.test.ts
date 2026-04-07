import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives and non-objects
  it('should return target as-is when source is empty', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, {})
    expect(result).toEqual(target)
  })

  it('should not mutate the target object', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { d: 3 } }
    deepMerge(target, source)
    expect(target).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should return a new object instance', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = deepMerge(target, source)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  // Shallow merge
  it('should shallow merge top-level properties', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 })
  })

  // Deep merge
  it('should deeply merge nested objects', () => {
    const target = { a: 1, b: { c: 2, e: 5 } }
    const source = { b: { c: 3, d: 4 } }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: { c: 3, d: 4, e: 5 } })
  })

  it('should deeply merge deeply nested objects', () => {
    const target = { a: { b: { c: { d: 1 } } } }
    const source = { a: { b: { c: { e: 2 } } } }
    expect(deepMerge(target, source)).toEqual({ a: { b: { c: { d: 1, e: 2 } } } })
  })

  // Arrays are replaced
  it('should replace arrays rather than merging them', () => {
    const target = { items: [1, 2, 3] }
    const source = { items: [4, 5] }
    expect(deepMerge(target, source)).toEqual({ items: [4, 5] })
  })

  it('should handle nested arrays', () => {
    const target = { a: { b: [1, 2] } }
    const source = { a: { b: [3] } }
    expect(deepMerge(target, source)).toEqual({ a: { b: [3] } })
  })

  // Null and primitive handling
  it('should replace target null with source value', () => {
    const target = { a: null }
    const source = { a: { b: 1 } }
    expect(deepMerge(target, source)).toEqual({ a: { b: 1 } })
  })

  it('should replace target primitive with source object', () => {
    const target = { a: 1 }
    const source = { a: { b: 2 } }
    expect(deepMerge(target, source)).toEqual({ a: { b: 2 } })
  })

  it('should replace target object with source primitive', () => {
    const target = { a: { b: 1 } }
    const source = { a: 2 }
    expect(deepMerge(target, source)).toEqual({ a: 2 })
  })

  it('should handle undefined source values', () => {
    const target = { a: 1, b: 2 }
    const source = { b: undefined }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: undefined })
  })

  // Mixed structures
  it('should handle mixed object and array structures', () => {
    const target = { a: 1, b: { c: [1, 2] }, d: ['x'] }
    const source = { b: { c: [3], e: 4 }, d: 'y' }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: { c: [3], e: 4 }, d: 'y' })
  })

  // New keys
  it('should add new keys from source', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 2 })
  })

  it('should add new nested keys from source', () => {
    const target = { a: 1 }
    const source = { b: { c: { d: 2 } } }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: { c: { d: 2 } } })
  })

  // Empty objects
  it('should return target when source is empty object', () => {
    const target = { a: { b: 1 } }
    expect(deepMerge(target, {})).toEqual({ a: { b: 1 } })
  })

  it('should return source when target is empty object', () => {
    const source = { a: { b: 1 } }
    expect(deepMerge({}, source)).toEqual({ a: { b: 1 } })
  })

  // Type preservation
  it('should preserve target type for top-level properties', () => {
    const target = { a: 1, b: 'hello' }
    const source = { c: true }
    const result = deepMerge(target, source)
    expect(result.a).toBe(1)
    expect(result.b).toBe('hello')
    expect(result.c).toBe(true)
  })
})
