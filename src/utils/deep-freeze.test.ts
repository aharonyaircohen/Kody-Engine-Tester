import { describe, it, expect } from 'vitest'
import { deepFreeze } from './deep-freeze'

describe('deepFreeze', () => {
  // Primitives — should return as-is
  it('should return null as-is', () => {
    expect(deepFreeze(null)).toBeNull()
  })

  it('should return primitive values as-is', () => {
    expect(deepFreeze(42)).toBe(42)
    expect(deepFreeze('hello')).toBe('hello')
    expect(deepFreeze(true)).toBe(true)
    expect(deepFreeze(undefined)).toBeUndefined()
  })

  // Plain objects
  it('should freeze a plain object', () => {
    const obj = { a: 1, b: { c: 2 } }
    const frozen = deepFreeze(obj)
    expect(frozen).toBe(obj)
    expect(Object.isFrozen(obj)).toBe(true)
    expect(Object.isFrozen(obj.b)).toBe(true)
  })

  it('should freeze an empty object', () => {
    const obj = {}
    deepFreeze(obj)
    expect(Object.isFrozen(obj)).toBe(true)
  })

  // Arrays
  it('should freeze an array', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const frozen = deepFreeze(arr)
    expect(frozen).toBe(arr)
    expect(Object.isFrozen(arr)).toBe(true)
    expect(Object.isFrozen(arr[1])).toBe(true)
    expect(Object.isFrozen(arr[2])).toBe(true)
  })

  it('should freeze an empty array', () => {
    const arr: unknown[] = []
    deepFreeze(arr)
    expect(Object.isFrozen(arr)).toBe(true)
  })

  // Map
  it('should freeze a Map', () => {
    const map = new Map<string, { x: number }>([['key', { x: 1 }]])
    const frozen = deepFreeze(map)
    expect(frozen).toBe(map)
    expect(Object.isFrozen(map)).toBe(true)
    expect(Object.isFrozen(map.get('key'))).toBe(true)
  })

  it('should freeze an empty Map', () => {
    const map = new Map()
    deepFreeze(map)
    expect(Object.isFrozen(map)).toBe(true)
  })

  // Set
  it('should freeze a Set', () => {
    const inner = { val: 42 }
    const set = new Set([inner, 'hello', 123])
    const frozen = deepFreeze(set)
    expect(frozen).toBe(set)
    expect(Object.isFrozen(set)).toBe(true)
    // The object inside should be frozen (same reference)
    const frozenInner = [...set].find((v) => typeof v === 'object' && v !== null) as { val: number }
    expect(Object.isFrozen(frozenInner)).toBe(true)
  })

  it('should freeze an empty Set', () => {
    const set = new Set()
    deepFreeze(set)
    expect(Object.isFrozen(set)).toBe(true)
  })

  // Nested combinations
  it('should handle deeply nested structures', () => {
    const obj = {
      name: 'test',
      tags: ['a', 'b'],
      meta: {
        counts: new Map([['hits', 5]]),
        ids: new Set([1, 2, 3]),
      },
    }
    deepFreeze(obj)
    expect(Object.isFrozen(obj)).toBe(true)
    expect(Object.isFrozen(obj.tags)).toBe(true)
    expect(Object.isFrozen(obj.meta)).toBe(true)
    expect(Object.isFrozen(obj.meta.counts)).toBe(true)
    expect(Object.isFrozen(obj.meta.ids)).toBe(true)
  })

  // Circular references — should not infinite loop
  it('should handle circular object reference', () => {
    const obj: Record<string, unknown> = { a: 1 }
    obj.self = obj
    const frozen = deepFreeze(obj)
    expect(frozen).toBe(obj)
    expect(Object.isFrozen(obj)).toBe(true)
  })

  it('should handle circular array reference', () => {
    const arr: unknown[] = [1, 2]
    arr.push(arr)
    deepFreeze(arr)
    expect(Object.isFrozen(arr)).toBe(true)
  })

  it('should handle deeply nested circular reference', () => {
    const a: Record<string, unknown> = {}
    const b: Record<string, unknown> = { parent: a }
    a.child = b
    deepFreeze(a)
    expect(Object.isFrozen(a)).toBe(true)
    expect(Object.isFrozen(b)).toBe(true)
  })

  // Mutability verification
  it('should prevent modification of frozen object', () => {
    const obj = { a: 1, b: { c: 2 } }
    deepFreeze(obj)
    expect(() => {
      obj.a = 99
    }).toThrow()
  })

  it('should prevent modification of nested frozen object', () => {
    const obj = { a: 1, b: { c: 2 } }
    deepFreeze(obj)
    expect(() => {
      obj.b.c = 99
    }).toThrow()
  })

  it('should prevent modification of frozen array', () => {
    const arr = [1, 2, 3]
    deepFreeze(arr)
    expect(() => {
      arr.push(4)
    }).toThrow()
  })

  // Note: Object.freeze on Map/Set does not prevent prototype methods (set/add).
  // The map/set themselves are frozen (Object.isFrozen returns true), but
  // mutation via prototype methods remains possible in V8.
})
