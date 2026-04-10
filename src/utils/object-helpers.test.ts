import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives and edge cases
  it('should return target when source is empty', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, {})
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should return target when source is undefined', () => {
    const target = { a: 1 }
    const result = deepMerge(target, {} as Partial<typeof target>)
    expect(result).toEqual({ a: 1 })
  })

  it('should not mutate the target object', () => {
    const target = { a: 1, b: { c: 2 } }
    const original = { ...target }
    deepMerge(target, { a: 10 })
    expect(target).toEqual(original)
  })

  it('should return a new object reference', () => {
    const target = { a: 1 }
    const result = deepMerge(target, { b: 2 } as Partial<typeof target>)
    expect(result).not.toBe(target)
  })

  // Primitive overwrites
  it('should overwrite primitive values', () => {
    const target = { a: 1, b: 'old' }
    const result = deepMerge(target, { a: 2, b: 'new' })
    expect(result).toEqual({ a: 2, b: 'new' })
  })

  it('should handle null values in target', () => {
    const target = { a: null } as Record<string, unknown>
    const result = deepMerge(target, { b: 2 })
    expect(result).toEqual({ a: null, b: 2 })
  })

  it('should handle undefined values in source', () => {
    const target = { a: 1 }
    const source = { a: undefined } as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1 })
  })

  // Nested objects
  it('should deeply merge nested objects', () => {
    const target = { a: 1, b: { c: 2, d: 3 } }
    const result = deepMerge(target, { b: { c: 20, e: 5 } } as Record<string, unknown>)
    expect(result).toEqual({ a: 1, b: { c: 20, d: 3, e: 5 } })
  })

  it('should add new nested properties', () => {
    const target = { a: { b: 1 } }
    const result = deepMerge(target, { a: { c: 2 } } as Record<string, unknown>)
    expect(result).toEqual({ a: { b: 1, c: 2 } })
  })

  it('should replace deeply nested object entirely when not an object', () => {
    const target = { a: { b: { c: 1 } } }
    const result = deepMerge(target, { a: { b: 2 } } as Record<string, unknown>)
    expect(result).toEqual({ a: { b: 2 } })
  })

  it('should handle deeply nested structures', () => {
    const target = { a: { b: { c: { d: 1 } } } }
    const result = deepMerge(target, { a: { b: { c: { e: 2 } } } } as Record<string, unknown>)
    expect(result).toEqual({ a: { b: { c: { d: 1, e: 2 } } } })
  })

  // Arrays (replaced, not merged)
  it('should replace arrays entirely', () => {
    const target = { a: [1, 2, 3] }
    const result = deepMerge(target, { a: [4, 5] })
    expect(result).toEqual({ a: [4, 5] })
  })

  it('should handle nested arrays', () => {
    const target = { a: { b: [1, 2] } }
    const result = deepMerge(target, { a: { b: [3] } })
    expect(result).toEqual({ a: { b: [3] } })
  })

  // Mixed structures
  it('should handle mixed primitive and object properties', () => {
    const target = { a: 1, b: { c: 2 }, d: ['old'] }
    const result = deepMerge(target, { a: 10, b: { c: 20 }, d: ['new'] })
    expect(result).toEqual({ a: 10, b: { c: 20 }, d: ['new'] })
  })

  it('should handle empty objects', () => {
    const target = {}
    const result = deepMerge(target, { a: 1 })
    expect(result).toEqual({ a: 1 })
  })

  it('should handle both empty objects', () => {
    const target = {}
    const result = deepMerge(target, {})
    expect(result).toEqual({})
  })

  // Type preservation
  it('should preserve target type for top-level properties', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, { a: 10 })
    expect(result.a).toBe(10)
    expect(result.b).toBe(2)
  })

  it('should handle numeric keys', () => {
    const target: Record<string, unknown> = { 0: 'a', 1: 'b' }
    const result = deepMerge(target, { 0: 'c' })
    expect(result).toEqual({ 0: 'c', 1: 'b' })
  })
})
