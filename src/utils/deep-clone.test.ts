import { describe, it, expect } from 'vitest'
import { deepClone } from './deep-clone'

describe('deepClone', () => {
  // Primitives
  it('should return null as-is', () => {
    expect(deepClone(null)).toBeNull()
  })

  it('should return primitive values as-is', () => {
    expect(deepClone(42)).toBe(42)
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone(true)).toBe(true)
    expect(deepClone(undefined)).toBeUndefined()
  })

  // Plain objects
  it('should deep clone a plain object', () => {
    const obj = { a: 1, b: { c: 2 } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.b).not.toBe(obj.b)
  })

  it('should clone an empty object', () => {
    const obj = {}
    const cloned = deepClone(obj)
    expect(cloned).toEqual({})
    expect(cloned).not.toBe(obj)
  })

  // Arrays
  it('should deep clone an array', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
    expect(cloned[1]).not.toBe(arr[1])
    expect(cloned[2]).not.toBe(arr[2])
  })

  it('should clone an empty array', () => {
    const arr: unknown[] = []
    const cloned = deepClone(arr)
    expect(cloned).toEqual([])
    expect(cloned).not.toBe(arr)
  })

  // Date
  it('should deep clone a Date', () => {
    const date = new Date('2024-01-15T12:00:00Z')
    const cloned = deepClone(date)
    expect(cloned).toEqual(date)
    expect(cloned).not.toBe(date)
    expect(cloned.getTime()).toBe(date.getTime())
  })

  it('should clone a Date nested in an object', () => {
    const obj = { created: new Date('2024-06-01') }
    const cloned = deepClone(obj)
    expect(cloned.created).toEqual(obj.created)
    expect(cloned.created).not.toBe(obj.created)
  })

  // RegExp
  it('should deep clone a RegExp', () => {
    const re = /foo(bar)?/gi
    const cloned = deepClone(re)
    expect(cloned).not.toBe(re)
    expect(cloned.source).toBe(re.source)
    expect(cloned.flags).toBe(re.flags)
  })

  it('should clone a RegExp nested in an object', () => {
    const obj = { pattern: /\d+/m }
    const cloned = deepClone(obj)
    expect(cloned.pattern.source).toBe(obj.pattern.source)
    expect(cloned.pattern.flags).toBe(obj.pattern.flags)
    expect(cloned.pattern).not.toBe(obj.pattern)
  })

  // Map
  it('should deep clone a Map', () => {
    const map = new Map<string, { x: number }>([['key', { x: 1 }]])
    const cloned = deepClone(map)
    expect(cloned).not.toBe(map)
    expect(cloned.get('key')).toEqual({ x: 1 })
    expect(cloned.get('key')).not.toBe(map.get('key'))
  })

  it('should clone an empty Map', () => {
    const map = new Map()
    const cloned = deepClone(map)
    expect(cloned.size).toBe(0)
    expect(cloned).not.toBe(map)
  })

  // Set
  it('should deep clone a Set', () => {
    const inner = { val: 42 }
    const set = new Set([inner, 'hello', 123])
    const cloned = deepClone(set)
    expect(cloned).not.toBe(set)
    expect(cloned.size).toBe(3)
    expect(cloned.has('hello')).toBe(true)
    expect(cloned.has(123)).toBe(true)
    // The object inside should be cloned (different reference)
    const clonedInner = [...cloned].find((v) => typeof v === 'object' && v !== null) as { val: number }
    expect(clonedInner).toEqual(inner)
    expect(clonedInner).not.toBe(inner)
  })

  it('should clone an empty Set', () => {
    const set = new Set()
    const cloned = deepClone(set)
    expect(cloned.size).toBe(0)
    expect(cloned).not.toBe(set)
  })

  // Nested combinations
  it('should handle deeply nested structures', () => {
    const obj = {
      name: 'test',
      tags: ['a', 'b'],
      meta: {
        created: new Date('2024-01-01'),
        pattern: /test/i,
        counts: new Map([['hits', 5]]),
        ids: new Set([1, 2, 3]),
      },
    }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.tags).not.toBe(obj.tags)
    expect(cloned.meta).not.toBe(obj.meta)
    expect(cloned.meta.created).not.toBe(obj.meta.created)
    expect(cloned.meta.pattern).not.toBe(obj.meta.pattern)
    expect(cloned.meta.counts).not.toBe(obj.meta.counts)
    expect(cloned.meta.ids).not.toBe(obj.meta.ids)
  })

  // Circular references
  it('should throw on circular object reference', () => {
    const obj: Record<string, unknown> = { a: 1 }
    obj.self = obj
    expect(() => deepClone(obj)).toThrow('Circular reference detected')
  })

  it('should throw on circular array reference', () => {
    const arr: unknown[] = [1, 2]
    arr.push(arr)
    expect(() => deepClone(arr)).toThrow('Circular reference detected')
  })

  it('should throw on deeply nested circular reference', () => {
    const a: Record<string, unknown> = {}
    const b: Record<string, unknown> = { parent: a }
    a.child = b
    expect(() => deepClone(a)).toThrow('Circular reference detected')
  })
})
