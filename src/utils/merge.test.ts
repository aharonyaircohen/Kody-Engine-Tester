import { describe, it, expect } from 'vitest'
import { merge } from './merge'

describe('merge', () => {
  // Basic merging
  it('should merge two flat objects', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = merge(target, source)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate the original objects', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = merge(target, source)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
    expect(target).toEqual({ a: 1 })
    expect(source).toEqual({ b: 2 })
  })

  // Conflicting keys
  it('should prefer source value on conflicting keys', () => {
    const target = { a: 1, b: 'original' }
    const source = { b: 'overridden', c: 3 }
    const result = merge(target, source)
    expect(result).toEqual({ a: 1, b: 'overridden', c: 3 })
  })

  // Deep merging
  it('should deeply merge nested objects', () => {
    const target = { a: 1, nested: { x: 10, y: 20 } }
    const source = { nested: { y: 30, z: 40 } }
    const result = merge(target, source)
    expect(result).toEqual({ a: 1, nested: { x: 10, y: 30, z: 40 } })
  })

  it('should not mutate nested objects during deep merge', () => {
    const target = { nested: { x: 10 } }
    const source = { nested: { y: 20 } }
    const result = merge(target, source)
    expect(result.nested).not.toBe(target.nested)
    expect(result.nested).not.toBe(source.nested)
  })

  it('should deeply merge deeply nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = merge(target, source)
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } })
  })

  // Arrays
  it('should replace arrays (not merge them)', () => {
    const target = { arr: [1, 2, 3] }
    const source = { arr: [4, 5] }
    const result = merge(target, source)
    expect(result).toEqual({ arr: [4, 5] })
  })

  it('should handle nested arrays', () => {
    const target = { outer: { arr: [1, 2] } }
    const source = { outer: { arr: [3] } }
    const result = merge(target, source)
    expect(result).toEqual({ outer: { arr: [3] } })
  })

  // Primitives and null
  it('should handle null values from source', () => {
    const target = { a: 1 }
    const source = { a: null }
    const result = merge(target, source)
    expect(result).toEqual({ a: null })
  })

  it('should handle null values from target', () => {
    const target = { a: null }
    const source = { b: 2 }
    const result = merge(target, source)
    expect(result).toEqual({ a: null, b: 2 })
  })

  it('should handle primitive source values overwriting objects', () => {
    const target = { a: { x: 1 } }
    const source = { a: 42 }
    const result = merge(target, source)
    expect(result).toEqual({ a: 42 })
  })

  it('should handle undefined values', () => {
    const target = { a: 1 }
    const source = { b: undefined }
    const result = merge(target, source)
    expect(result).toEqual({ a: 1, b: undefined })
  })

  // Empty objects
  it('should handle empty target', () => {
    const target = {}
    const source = { a: 1, b: { nested: 2 } }
    const result = merge(target, source)
    expect(result).toEqual({ a: 1, b: { nested: 2 } })
  })

  it('should handle empty source', () => {
    const target = { a: 1, b: { nested: 2 } }
    const source = {}
    const result = merge(target, source)
    expect(result).toEqual({ a: 1, b: { nested: 2 } })
  })

  it('should handle both empty objects', () => {
    const target = {}
    const source = {}
    const result = merge(target, source)
    expect(result).toEqual({})
  })

  // Return type
  it('should preserve target and source types in return', () => {
    const target: { a: number } = { a: 1 }
    const source: { b: string } = { b: 'hello' }
    const result = merge(target, source)
    expect(result.a).toBe(1)
    expect(result.b).toBe('hello')
  })
})
