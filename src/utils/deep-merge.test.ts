import { describe, it, expect } from 'vitest'
import { deepMerge } from './deep-merge'

describe('deepMerge', () => {
  // Basic merge
  it('should merge two plain objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should merge multiple sources', () => {
    const target = { a: 1 }
    const source1 = { b: 2 }
    const source2 = { c: 3 }
    const result = deepMerge(target, source1, source2)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  // Deep merge
  it('should deeply merge nested objects', () => {
    const target = { a: { b: 1, c: 2 } }
    const source = { a: { d: 3 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: 1, c: 2, d: 3 } })
  })

  it('should handle deeply nested structures', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } })
  })

  // Arrays
  it('should replace arrays instead of concatenating', () => {
    const target = { arr: [1, 2, 3] }
    const source = { arr: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ arr: [4, 5] })
  })

  it('should handle arrays at nested levels', () => {
    const target = { a: { arr: [1, 2] } }
    const source = { a: { arr: [3] } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { arr: [3] } })
  })

  // Primitives and edge cases
  it('should replace primitive values', () => {
    const target = { a: 1, b: 'hello' }
    const source = { a: 2, b: 'world' }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 2, b: 'world' })
  })

  it('should handle null values', () => {
    const target = { a: null }
    const source = { b: 1 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: null, b: 1 })
  })

  it('should handle undefined values', () => {
    const target = { a: undefined }
    const source = { a: 1 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1 })
  })

  it('should handle empty objects', () => {
    const target = {}
    const source = { a: 1 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1 })
  })

  it('should handle empty sources', () => {
    const target = { a: 1 }
    const result = deepMerge(target, {})
    expect(result).toEqual({ a: 1 })
  })

  // Returns target
  it('should return the mutated target', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = deepMerge(target, source)
    expect(result).toBe(target)
  })

  // Mixed nested
  it('should handle mixed nested objects and arrays', () => {
    const target = {
      user: { name: 'Alice', scores: [1, 2] },
      tags: ['a', 'b'],
    }
    const source = {
      user: { age: 30 },
      scores: [3, 4],
      tags: ['c'],
    }
    const result = deepMerge(target, source)
    expect(result).toEqual({
      user: { name: 'Alice', scores: [1, 2], age: 30 },
      scores: [3, 4],
      tags: ['c'],
    })
  })
})
