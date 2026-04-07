import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Null/undefined handling
  it('should return target when source is null', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, null as unknown as Partial<typeof target>)
    expect(result).toEqual(target)
    expect(result).not.toBe(target)
  })

  it('should return target when source is undefined', () => {
    const target = { a: 1, b: 2 }
    const result = deepMerge(target, undefined as unknown as Partial<typeof target>)
    expect(result).toEqual(target)
    expect(result).not.toBe(target)
  })

  // Primitives
  it('should return primitive source when target is primitive-like', () => {
    expect(deepMerge(42 as unknown as object, 100 as unknown as Partial<object>)).toBe(100)
    expect(deepMerge('hello' as unknown as object, 'world' as unknown as Partial<object>)).toBe('world')
    expect(deepMerge(true as unknown as object, false as unknown as Partial<object>)).toBe(false)
  })

  // Plain objects - basic merge
  it('should merge two plain objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source as any)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should not mutate target', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3 }
    deepMerge(target, source as any)
    expect(target).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate source', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    deepMerge(target, source as any)
    expect(source).toEqual({ b: 2 })
  })

  it('should return a new object (not the same reference)', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    const result = deepMerge(target, source as any)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  it('should handle empty target', () => {
    const target = {}
    const source = { a: 1, b: { nested: 2 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: { nested: 2 } })
  })

  it('should handle empty source', () => {
    const target = { a: 1 }
    const source = {}
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1 })
  })

  // Nested objects
  it('should deeply merge nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = deepMerge(target, source as any)
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } })
  })

  it('should not mutate nested objects', () => {
    const target = { a: { b: { c: 1 } } }
    const source = { a: { b: { d: 2 } } }
    const result = deepMerge(target, source as any)
    expect(result.a).not.toBe(target.a)
    expect(result.a.b).not.toBe(target.a.b)
    expect(target.a.b).toEqual({ c: 1 })
  })

  it('should handle deeply nested structures', () => {
    const target = {
      level1: {
        level2: {
          level3: {
            a: 1,
            b: { c: 2 },
          },
        },
      },
    }
    const source = {
      level1: {
        level2: {
          level3: {
            b: { d: 3 },
            e: 4,
          },
        },
      },
    }
    const result = deepMerge(target, source as any)
    expect(result).toEqual({
      level1: {
        level2: {
          level3: {
            a: 1,
            b: { c: 2, d: 3 },
            e: 4,
          },
        },
      },
    })
  })

  // Arrays - replaced not merged
  it('should replace arrays with source arrays', () => {
    const target = { arr: [1, 2, 3] }
    const source = { arr: [4, 5] }
    const result = deepMerge(target, source as any)
    expect(result).toEqual({ arr: [4, 5] })
  })

  it('should clone array elements', () => {
    const target = { arr: [1, 2] }
    const source = { arr: [{ nested: 3 }] }
    const result = deepMerge(target, source as any)
    expect(result.arr[0]).not.toBe(source.arr[0])
    expect(result.arr[0]).toEqual({ nested: 3 })
  })

  it('should handle nested arrays in merged objects', () => {
    const target = { outer: { inner: [1, 2] } }
    const source = { outer: { extra: 'value' } }
    const result = deepMerge(target, source as any)
    expect(result).toEqual({ outer: { inner: [1, 2], extra: 'value' } })
  })

  // Date handling
  it('should replace Date with source Date', () => {
    const target = { date: new Date('2024-01-01') }
    const source = { date: new Date('2024-06-15') }
    const result = deepMerge(target, source)
    expect(result.date).toEqual(new Date('2024-06-15'))
    expect(result.date).not.toBe(source.date)
  })

  it('should preserve Date when source does not have Date for that key', () => {
    const target = { date: new Date('2024-01-01'), other: 'keep' }
    const source = { other: 'change' }
    const result = deepMerge(target, source)
    expect(result.date).toEqual(new Date('2024-01-01'))
    expect(result.other).toBe('change')
  })

  // RegExp handling
  it('should replace RegExp with source RegExp', () => {
    const target = { pattern: /foo/gi }
    const source = { pattern: /bar/imu }
    const result = deepMerge(target, source)
    expect(result.pattern.source).toBe('bar')
    expect(result.pattern.flags).toBe('imu')
    expect(result.pattern).not.toBe(source.pattern)
  })

  it('should preserve RegExp when source does not have RegExp for that key', () => {
    const target = { pattern: /foo/gi, other: 'keep' }
    const source = { other: 'change' }
    const result = deepMerge(target, source)
    expect(result.pattern.source).toBe('foo')
    expect(result.pattern.flags).toBe('gi')
    expect(result.other).toBe('change')
  })

  // Map handling
  it('should replace Map with source Map', () => {
    const target = { map: new Map([['a', 1]]) }
    const source = { map: new Map([['b', 2]]) }
    const result = deepMerge(target, source)
    expect(result.map.get('b')).toBe(2)
    expect(result.map.has('a')).toBe(false)
  })

  it('should clone Map entries', () => {
    const inner = { x: 1 }
    const target = { map: new Map([[inner, 'obj']]) }
    const source = { map: new Map([[inner, 'obj']]) }
    const result = deepMerge(target, source)
    expect(result.map).not.toBe(target.map)
    expect([...result.map.keys()][0]).not.toBe(inner)
  })

  // Set handling
  it('should replace Set with source Set', () => {
    const target = { set: new Set([1, 2]) }
    const source = { set: new Set([3, 4]) }
    const result = deepMerge(target, source)
    expect(result.set.has(3)).toBe(true)
    expect(result.set.has(1)).toBe(false)
  })

  it('should clone Set entries', () => {
    const inner = { y: 2 }
    const target = { set: new Set([inner]) }
    const source = { set: new Set([inner]) }
    const result = deepMerge(target, source)
    expect(result.set).not.toBe(target.set)
    expect([...result.set][0]).not.toBe(inner)
  })

  // Mixed nested structures
  it('should handle mixed Date, RegExp, Map, Set in nested objects', () => {
    const target = {
      meta: {
        created: new Date('2024-01-01'),
        pattern: /\d+/,
        counts: new Map([['hits', 5]]),
        ids: new Set([1, 2]),
        tags: ['a', 'b'],
        nested: { deep: true },
      },
    }
    const source = {
      meta: {
        created: new Date('2024-06-01'),
        pattern: /\w+/i,
        counts: new Map([['views', 10]]),
        ids: new Set([3, 4]),
        tags: ['c'],
        nested: { extra: 'value' },
      },
    }
    const result = deepMerge(target, source as any)

    // Date and RegExp replaced
    expect(result.meta.created).toEqual(new Date('2024-06-01'))
    expect(result.meta.pattern.source).toBe('\\w+')
    expect(result.meta.pattern.flags).toBe('i')

    // Map and Set replaced
    expect(result.meta.counts.get('views')).toBe(10)
    expect(result.meta.counts.has('hits')).toBe(false)
    expect(result.meta.ids.has(3)).toBe(true)
    expect(result.meta.ids.has(1)).toBe(false)

    // Arrays replaced
    expect(result.meta.tags).toEqual(['c'])

    // Nested objects merged
    expect(result.meta.nested).toEqual({ deep: true, extra: 'value' })
  })

  // Circular references
  it('should throw on circular reference in target', () => {
    const target: Record<string, unknown> = { a: 1 }
    target.self = target
    const source = { b: 2 }
    expect(() => deepMerge(target, source as any)).toThrow('Circular reference detected in target')
  })

  it('should throw on circular reference in source', () => {
    const target = { a: 1 }
    const source: Record<string, unknown> = { b: 2 }
    source.self = source
    expect(() => deepMerge(target, source as any)).toThrow('Circular reference detected')
  })

  it('should throw on deeply nested circular reference', () => {
    const a: Record<string, unknown> = {}
    const b: Record<string, unknown> = { parent: a }
    a.child = b
    const target = { level: a }
    const source = { level: { extra: 'value' } }
    expect(() => deepMerge(target, source as any)).toThrow('Circular reference detected')
  })

  // Source property override behavior
  it('should override target properties with source when source has value', () => {
    const target = { a: 1, b: 2, c: 3 }
    const source = { a: null, b: undefined, c: 4 }
    const result = deepMerge(target, source as any)
    // null and undefined in source should still override (null for object types becomes null, undefined doesn't change primitive types in the same way)
    expect(result.c).toBe(4)
  })

  it('should handle source undefined for object properties', () => {
    const target = { a: { nested: 1 } }
    const source = { a: undefined }
    const result = deepMerge(target, source as any)
    // When source value is undefined for an object property, target should be preserved
    expect(result.a).toEqual({ nested: 1 })
  })

  it('should handle source null for object properties', () => {
    const target = { a: { nested: 1 } }
    const source = { a: null }
    const result = deepMerge(target, source as any)
    // null source should result in null (replacing the object)
    expect(result.a).toBeNull()
  })

  // Realistic use cases
  it('should handle config object merge pattern', () => {
    const defaults = {
      host: 'localhost',
      port: 3000,
      db: {
        name: 'test',
        pool: { min: 2, max: 10 },
      },
      features: ['auth', 'logging'],
    }
    const overrides = {
      port: 8080,
      db: {
        pool: { max: 20 },
      },
      features: ['auth', 'logging', 'metrics'],
    }
    const result = deepMerge(defaults, overrides as any)
    expect(result).toEqual({
      host: 'localhost',
      port: 8080,
      db: {
        name: 'test',
        pool: { min: 2, max: 20 },
      },
      features: ['auth', 'logging', 'metrics'],
    })
    // Original defaults unchanged
    expect(defaults.port).toBe(3000)
    expect(defaults.db.pool.max).toBe(10)
    expect(defaults.features).toEqual(['auth', 'logging'])
  })
})
