import { describe, it, expect } from 'vitest'
import { deepFreeze } from './deep-freeze'

describe('deepFreeze', () => {
  // Primitives
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
  it('should deep freeze a plain object', () => {
    const obj = { a: 1, b: { c: 2 } }
    const frozen = deepFreeze(obj)
    expect(Object.isFrozen(obj)).toBe(true)
    expect(Object.isFrozen(obj.b)).toBe(true)
  })

  it('should freeze an empty object', () => {
    const obj = {}
    deepFreeze(obj)
    expect(Object.isFrozen(obj)).toBe(true)
  })

  // Arrays
  it('should deep freeze an array', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const frozen = deepFreeze(arr)
    expect(Object.isFrozen(arr)).toBe(true)
    expect(Object.isFrozen(arr[1])).toBe(true)
    expect(Object.isFrozen(arr[2])).toBe(true)
  })

  it('should freeze an empty array', () => {
    const arr: unknown[] = []
    deepFreeze(arr)
    expect(Object.isFrozen(arr)).toBe(true)
  })

  // Nested combinations
  it('should handle deeply nested structures', () => {
    const obj = {
      name: 'test',
      tags: ['a', 'b'],
      meta: {
        nested: {
          value: 42,
        },
      },
    }
    deepFreeze(obj)
    expect(Object.isFrozen(obj)).toBe(true)
    expect(Object.isFrozen(obj.tags)).toBe(true)
    expect(Object.isFrozen(obj.meta)).toBe(true)
    expect(Object.isFrozen(obj.meta.nested)).toBe(true)
  })

  it('should return the same object reference', () => {
    const obj = { a: 1 }
    const frozen = deepFreeze(obj)
    expect(frozen).toBe(obj)
  })

  // Already frozen objects
  it('should return already frozen objects as-is', () => {
    const obj = Object.freeze({ a: 1 })
    const frozen = deepFreeze(obj)
    expect(frozen).toBe(obj)
  })

  it('should handle nested already frozen objects', () => {
    const inner = Object.freeze({ b: 2 })
    const outer = { a: inner }
    const frozen = deepFreeze(outer)
    expect(frozen).toBe(outer)
    expect(frozen.a).toBe(inner)
  })

  // Prevent modification
  it('should prevent modification of frozen object', () => {
    const obj = { a: 1 }
    deepFreeze(obj)
    expect(() => {
      obj.a = 2
    }).toThrow()
  })

  it('should prevent modification of nested object', () => {
    const obj = { a: { b: 1 } }
    deepFreeze(obj)
    expect(() => {
      obj.a.b = 2
    }).toThrow()
  })

  it('should prevent modification of frozen array', () => {
    const arr = [1, 2, 3]
    deepFreeze(arr)
    expect(() => {
      arr[0] = 0
    }).toThrow()
  })

  it('should prevent modification of nested array', () => {
    const obj = { arr: [1, 2] }
    deepFreeze(obj)
    expect(() => {
      obj.arr.push(3)
    }).toThrow()
  })
})