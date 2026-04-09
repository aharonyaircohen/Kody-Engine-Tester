import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives
  it('should return target when source is null', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, { a: null } as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: null, b: 2 })
  })

  it('should return target when source is undefined', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, { a: undefined } as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: undefined, b: 2 })
  })

  it('should override primitives in target with source values', () => {
    const target = { a: 1, b: 'hello', c: true }
    const source = { a: 42, b: 'world', c: false }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 42, b: 'world', c: false })
  })

  it('should not mutate the target object', () => {
    const target = { a: 1, b: { nested: 'original' } }
    const source = { b: { nested: 'changed' } }
    deepMerge(target, source as Partial<typeof target>)
    expect(target).toEqual({ a: 1, b: { nested: 'original' } })
  })

  it('should not mutate the source object', () => {
    const target = { a: 1 }
    const source: Partial<{ a: number; b: { nested: string } }> = { b: { nested: 'source' } }
    deepMerge(target, source)
    expect(source).toEqual({ b: { nested: 'source' } })
  })

  // Plain objects
  it('should deep merge nested plain objects', () => {
    const target = { a: 1, b: { c: 2, d: 3 } }
    const source = { b: { c: 20, e: 5 } }
    const result = deepMerge(target, source as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: 1, b: { c: 20, d: 3, e: 5 } })
  })

  it('should handle deeply nested structures', () => {
    const target = { a: { b: { c: { d: 1 } } } }
    const source = { a: { b: { c: { e: 2 } } } }
    const result = deepMerge(target, source as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: { b: { c: { d: 1, e: 2 } } } })
  })

  it('should replace target nested object with source when source has primitive', () => {
    const target = { a: { b: 1 } }
    const source = { a: 2 }
    const result = deepMerge(target, source as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: 2 })
  })

  // Arrays
  it('should replace arrays (not concatenate)', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [4, 5] })
  })

  it('should handle nested arrays', () => {
    const target = { a: [[1, 2], [3, 4]] }
    const source = { a: [[5, 6]] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [[5, 6]] })
  })

  it('should handle arrays with objects inside', () => {
    const target = { a: [{ x: 1 }] }
    const source = { a: [{ y: 2 }] }
    const result = deepMerge(target, source as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: [{ y: 2 }] })
  })

  it('should handle empty arrays', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: [] })
  })

  // Date
  it('should deep merge Date properties', () => {
    const target = { created: new Date('2024-01-15T12:00:00Z') }
    const source = { created: new Date('2024-06-01T00:00:00Z') }
    const result = deepMerge(target, source)
    expect(result.created).toEqual(new Date('2024-06-01T00:00:00Z'))
    expect(result.created).not.toBe(target.created)
    expect(result.created).not.toBe(source.created)
  })

  it('should handle Date merged from undefined', () => {
    const target = { created: new Date('2024-01-15T12:00:00Z') }
    const source = { created: undefined }
    const result = deepMerge(target, source)
    expect(result.created).toBeUndefined()
  })

  // RegExp
  it('should deep merge RegExp properties', () => {
    const target = { pattern: /foo/gi }
    const source = { pattern: /bar/im }
    const result = deepMerge(target, source)
    expect(result.pattern.source).toBe('bar')
    expect(result.pattern.flags).toBe('im')
    expect(result.pattern).not.toBe(target.pattern)
    expect(result.pattern).not.toBe(source.pattern)
  })

  it('should handle RegExp merged from undefined', () => {
    const target = { pattern: /foo/gi }
    const source = { pattern: undefined }
    const result = deepMerge(target, source)
    expect(result.pattern).toBeUndefined()
  })

  // Map
  it('should deep merge Map properties', () => {
    const target = { map: new Map([['a', 1], ['b', 2]]) }
    const source = { map: new Map([['b', 20], ['c', 3]]) }
    const result = deepMerge(target, source)
    expect(result.map).toEqual(new Map([['b', 20], ['c', 3]]))
    expect(result.map).not.toBe(target.map)
    expect(result.map).not.toBe(source.map)
  })

  it('should handle Map merged from undefined', () => {
    const target = { map: new Map([['a', 1]]) }
    const source = { map: undefined }
    const result = deepMerge(target, source)
    expect(result.map).toBeUndefined()
  })

  // Set
  it('should deep merge Set properties', () => {
    const target = { set: new Set([1, 2, 3]) }
    const source = { set: new Set([2, 3, 4]) }
    const result = deepMerge(target, source)
    expect(result.set).toEqual(new Set([2, 3, 4]))
    expect(result.set).not.toBe(target.set)
    expect(result.set).not.toBe(source.set)
  })

  it('should handle Set merged from undefined', () => {
    const target = { set: new Set([1, 2]) }
    const source = { set: undefined }
    const result = deepMerge(target, source)
    expect(result.set).toBeUndefined()
  })

  // Mixed nested structures
  it('should handle deeply nested mixed structures', () => {
    const target: Record<string, unknown> = {
      name: 'test',
      tags: ['a', 'b'],
      meta: {
        created: new Date('2024-01-01'),
        pattern: /\d+/i,
        counts: new Map([['hits', 5]]),
        ids: new Set([1, 2, 3]),
        nested: { deep: { value: 1 } },
      },
    }
    const source: Partial<Record<string, unknown>> = {
      tags: ['c'],
      meta: {
        created: new Date('2024-06-01'),
        pattern: /\w+/g,
        counts: new Map([['misses', 2]]),
        ids: new Set([4, 5]),
        nested: { deep: { extra: 2 } },
      },
    }
    const result = deepMerge(target, source) as typeof target & typeof source

    expect(result.name).toBe('test')
    expect(result.tags).toEqual(['c'])
    expect((result.meta as { created: Date }).created).toEqual(new Date('2024-06-01'))
    expect((result.meta as { pattern: RegExp }).pattern.source).toBe('\\w+')
    expect((result.meta as { pattern: RegExp }).pattern.flags).toBe('g')
    expect((result.meta as { counts: Map<string, number> }).counts).toEqual(new Map([['misses', 2]]))
    expect((result.meta as { ids: Set<number> }).ids).toEqual(new Set([4, 5]))
    expect((result.meta as { nested: { deep: { value: number; extra: number } } }).nested).toEqual({
      deep: { value: 1, extra: 2 },
    })
  })

  // Edge cases
  it('should handle empty target object', () => {
    const target = {}
    const source = { a: 1, b: { nested: 2 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { nested: 2 } })
  })

  it('should handle empty source object', () => {
    const target = { a: 1, b: 2 }
    const source = {}
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should handle both empty objects', () => {
    const target = {}
    const source = {}
    const result = deepMerge(target, source)
    expect(result).toEqual({})
  })

  it('should add new keys from source to target', () => {
    const target = { a: 1 }
    const source = { b: 2, c: 3 }
    const result = deepMerge(target, source as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle null values in source', () => {
    const target = { a: 1, b: 2 }
    const source = { a: null, c: 3 }
    const result = deepMerge(target, source as unknown as Partial<typeof target>)
    expect(result).toEqual({ a: null, b: 2, c: 3 })
  })

  it('should preserve target properties not in source', () => {
    const target = { a: 1, b: 2, c: 3 }
    const source = { b: 20 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 20, c: 3 })
  })
})
