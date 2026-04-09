import { describe, it, expect } from 'vitest'
import { deepMerge } from './object-helpers'

describe('deepMerge', () => {
  // Primitives
  it('should return target unchanged when source is null', () => {
    const target = { a: 1 }
    expect(deepMerge(target, null as unknown as Partial<typeof target>)).toEqual({ a: 1 })
    expect(deepMerge(target, null as unknown as Partial<typeof target>)).toBe(target)
  })

  it('should return target unchanged when source is undefined', () => {
    const target = { a: 1 }
    expect(deepMerge(target, undefined as unknown as Partial<typeof target>)).toEqual({ a: 1 })
    expect(deepMerge(target, undefined as unknown as Partial<typeof target>)).toBe(target)
  })

  it('should return target unchanged when source is a primitive', () => {
    expect(deepMerge({ a: 1 }, 42 as unknown as Partial<{ a: number }>)).toEqual({ a: 1 })
    expect(deepMerge({ a: 1 }, 'hello' as unknown as Partial<{ a: number }>)).toEqual({ a: 1 })
    expect(deepMerge({ a: 1 }, true as unknown as Partial<{ a: number }>)).toEqual({ a: 1 })
  })

  // Plain objects
  it('should merge simple properties', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should not mutate the original target', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { b: { d: 3 } } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(target.b).toEqual({ c: 2 })
    expect(result.b).not.toBe(target.b)
  })

  it('should merge nested objects recursively', () => {
    const target = { a: 1, nested: { b: 2, c: 3 } }
    const source = { nested: { c: 4, d: 5 } } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, nested: { b: 2, c: 4, d: 5 } })
  })

  it('should handle empty objects', () => {
    const target = {}
    const source = { a: 1 }
    expect(deepMerge(target, source)).toEqual({ a: 1 })
  })

  it('should handle merging empty source', () => {
    const target = { a: 1 }
    const source = {}
    expect(deepMerge(target, source)).toEqual({ a: 1 })
  })

  // Arrays
  it('should replace arrays rather than concatenating', () => {
    const target = { arr: [1, 2, 3] }
    const source = { arr: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ arr: [4, 5] })
    expect(result.arr).not.toBe(target.arr)
    expect(result.arr).not.toBe(source.arr)
  })

  it('should handle nested arrays', () => {
    const target = { outer: { arr: [1, 2] } }
    const source = { outer: { arr: [3] } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ outer: { arr: [3] } })
  })

  // Date
  it('should merge Date objects by replacement', () => {
    const target = { date: new Date('2024-01-01') }
    const source = { date: new Date('2024-06-15') }
    const result = deepMerge(target, source)
    expect(result.date).toEqual(new Date('2024-06-15'))
    expect(result.date).not.toBe(target.date)
    expect(result.date).not.toBe(source.date)
  })

  // RegExp
  it('should merge RegExp objects by replacement', () => {
    const target = { pattern: /abc/gi }
    const source = { pattern: /def/i }
    const result = deepMerge(target, source)
    expect(result.pattern.source).toBe('def')
    expect(result.pattern.flags).toBe('i')
    expect(result.pattern).not.toBe(target.pattern)
    expect(result.pattern).not.toBe(source.pattern)
  })

  // Map
  it('should merge Map objects', () => {
    const target = new Map([['a', 1], ['b', 2]])
    const source = new Map([['b', 3], ['c', 4]])
    const result = deepMerge(target, source)
    expect(result.get('a')).toBe(1)
    expect(result.get('b')).toBe(3)
    expect(result.get('c')).toBe(4)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  // Set
  it('should merge Set objects', () => {
    const target = new Set([1, 2, 3])
    const source = new Set([3, 4, 5])
    const result = deepMerge(target, source)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
    expect(result.has(3)).toBe(true)
    expect(result.has(4)).toBe(true)
    expect(result.has(5)).toBe(true)
    expect(result).not.toBe(target)
    expect(result).not.toBe(source)
  })

  // Undefined handling
  it('should not override with undefined values', () => {
    const target = { a: 1, b: 2 }
    const source = { b: undefined } as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should handle undefined source property in nested object', () => {
    const target = { nested: { a: 1, b: 2 } }
    const source = { nested: { b: undefined } } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result).toEqual({ nested: { a: 1, b: 2 } })
  })

  // Nested combinations
  it('should handle deeply nested structures', () => {
    const target = {
      level1: {
        level2: {
          level3: { a: 1, b: 2 },
          arr: [1, 2],
        },
        map: new Map([['key', 'value']]),
      },
    }
    const source = {
      level1: {
        level2: {
          level3: { b: 3, c: 4 },
          arr: [3],
        },
        map: new Map([['key2', 'value2']]),
      },
    } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result.level1.level2.level3).toEqual({ a: 1, b: 3, c: 4 })
    expect(result.level1.level2.arr).toEqual([3])
    expect(result.level1.map.get('key')).toBe('value')
    expect(result.level1.map.get('key2')).toBe('value2')
  })

  it('should handle mixed types at same level', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = { a: 'hello', b: [1, 2, 3] } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 'hello', b: [1, 2, 3] })
  })

  // Type preservation
  it('should preserve target type when source is empty', () => {
    interface TargetType { a: number; b: string }
    const target: TargetType = { a: 1, b: 'test' }
    const result = deepMerge(target, {})
    expect(result).toEqual({ a: 1, b: 'test' })
  })

  // Edge cases
  it('should handle source with extra properties not in target', () => {
    const target = { a: 1 }
    const source = { a: 2, b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 2, b: 3, c: 4 })
  })

  it('should handle null values in objects', () => {
    const target = { a: null, b: 1 }
    const source = { a: { nested: true } } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: { nested: true }, b: 1 })
  })

  it('should handle null nested objects merging', () => {
    const target = { a: { x: 1 } }
    const source = { a: null } as unknown as Partial<typeof target>
    const result = deepMerge(target, source)
    // source null should not override existing object
    expect(result).toEqual({ a: { x: 1 } })
  })
})
