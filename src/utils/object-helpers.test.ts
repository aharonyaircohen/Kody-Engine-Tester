import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Basic merge behavior
  it('should merge two plain objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should not mutate the target', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3 }
    deepMerge(target, source)
    expect(target).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate the source', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    deepMerge(target, source)
    expect(source).toEqual({ b: 2 })
  })

  it('should return target when source is empty', () => {
    const target = { a: 1, b: 2 }
    const source = {}
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 2 })
    expect(result).not.toBe(target)
  })

  it('should return a copy of target when source is empty object', () => {
    const target = { a: 1 }
    const result = deepMerge(target, {})
    expect(result).toEqual({ a: 1 })
    expect(result).not.toBe(target)
  })

  // Nested objects
  it('should recursively merge nested objects', () => {
    const target = { a: { nested: 1 }, b: 2 }
    const source = { a: { extra: 3 }, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { nested: 1, extra: 3 }, b: 2, c: 4 })
  })

  it('should not mutate nested objects in target', () => {
    const target = { a: { nested: 1 } }
    const source = { a: { extra: 3 } }
    const result = deepMerge(target, source)
    expect(target.a).toEqual({ nested: 1 })
    expect(result.a).not.toBe(target.a)
  })

  it('should deeply merge deeply nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } })
    expect(result.a.b).not.toBe(target.a.b)
  })

  // Arrays
  it('should replace arrays rather than merge', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [4, 5] })
  })

  it('should not mutate source array when merging', () => {
    const target = { a: [1, 2] }
    const source = { a: [3, 4] }
    const result = deepMerge(target, source)
    expect(source.a).toEqual([3, 4])
    expect(result.a).not.toBe(source.a)
  })

  // Primitives
  it('should overwrite primitive values', () => {
    const target = { a: 1, b: 'old' }
    const source = { a: 2, b: 'new' }
    expect(deepMerge(target, source)).toEqual({ a: 2, b: 'new' })
  })

  it('should handle null source values', () => {
    const target = { a: 1 }
    const source = { a: null }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: null })
  })

  it('should handle undefined source values', () => {
    const target = { a: 1 }
    const source = { a: undefined }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: undefined })
  })

  // Date
  it('should clone Date objects', () => {
    const target = { a: new Date('2024-01-01') }
    const source = { a: new Date('2024-06-01') }
    const result = deepMerge(target, source)
    expect(result.a).toEqual(new Date('2024-06-01'))
    expect(result.a).not.toBe(source.a)
  })

  // RegExp
  it('should clone RegExp objects', () => {
    const target = { a: /foo/gi }
    const source = { a: /bar/m }
    const result = deepMerge(target, source)
    expect(result.a.source).toBe('bar')
    expect(result.a.flags).toBe('m')
    expect(result.a).not.toBe(source.a)
  })

  // Map
  it('should clone Map objects', () => {
    const target = { a: new Map([['x', 1]]) }
    const source = { a: new Map([['y', 2]]) }
    const result = deepMerge(target, source)
    expect(result.a.get('y')).toBe(2)
    expect(result.a).not.toBe(source.a)
  })

  // Set
  it('should clone Set objects', () => {
    const target = { a: new Set([1]) }
    const source = { a: new Set([2, 3]) }
    const result = deepMerge(target, source)
    expect([...result.a]).toEqual([2, 3])
    expect(result.a).not.toBe(source.a)
  })

  // Mixed
  it('should handle mixed nested structures', () => {
    const target = {
      name: 'test',
      meta: { tags: ['a', 'b'], count: 1 },
      active: true,
    }
    const source = {
      name: 'updated',
      meta: { tags: ['c'], extra: true },
    }
    const result = deepMerge(target, source)
    expect(result).toEqual({
      name: 'updated',
      meta: { tags: ['c'], count: 1, extra: true },
      active: true,
    })
  })

  it('should handle empty objects', () => {
    expect(deepMerge({}, {})).toEqual({})
  })

  it('should handle target with more keys than source', () => {
    const target = { a: 1, b: 2, c: 3 }
    const source = { a: 10 }
    expect(deepMerge(target, source)).toEqual({ a: 10, b: 2, c: 3 })
  })
})
