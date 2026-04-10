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
  it('should freeze a plain object', () => {
    const obj = { a: 1, b: { c: 2 } }
    const frozen = deepFreeze(obj)
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(Object.isFrozen(frozen.b)).toBe(true)
  })

  it('should freeze an empty object', () => {
    const obj = {}
    const frozen = deepFreeze(obj)
    expect(Object.isFrozen(frozen)).toBe(true)
  })

  it('should return the same object reference', () => {
    const obj = { a: 1 }
    const frozen = deepFreeze(obj)
    expect(frozen).toBe(obj)
  })

  // Arrays
  it('should freeze an array', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const frozen = deepFreeze(arr)
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(Object.isFrozen(frozen[1])).toBe(true)
    expect(Object.isFrozen(frozen[2])).toBe(true)
  })

  it('should freeze an empty array', () => {
    const arr: unknown[] = []
    const frozen = deepFreeze(arr)
    expect(Object.isFrozen(frozen)).toBe(true)
  })

  // Nested structures
  it('should handle deeply nested structures', () => {
    const obj = {
      name: 'test',
      tags: ['a', 'b'],
      meta: {
        created: { timestamp: 1234567890 },
        counts: [1, 2, 3],
      },
    }
    const frozen = deepFreeze(obj)
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(Object.isFrozen(frozen.tags)).toBe(true)
    expect(Object.isFrozen(frozen.meta)).toBe(true)
    expect(Object.isFrozen(frozen.meta.created)).toBe(true)
    expect(Object.isFrozen(frozen.meta.counts)).toBe(true)
  })

  // Circular references
  it('should handle circular object references', () => {
    const obj: Record<string, unknown> = { a: 1 }
    obj.self = obj
    const frozen = deepFreeze(obj)
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(frozen.self).toBe(obj)
  })

  it('should handle circular array references', () => {
    const arr: unknown[] = [1, 2]
    arr.push(arr)
    const frozen = deepFreeze(arr)
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(frozen[2]).toBe(arr)
  })

  it('should handle deeply nested circular references', () => {
    const a: Record<string, unknown> = {}
    const b: Record<string, unknown> = { parent: a }
    a.child = b
    const frozen = deepFreeze(a)
    expect(Object.isFrozen(frozen)).toBe(true)
    expect(Object.isFrozen((frozen as Record<string, unknown>).child as object)).toBe(true)
    const child = (frozen as Record<string, unknown>).child as Record<string, unknown>
    expect(child.parent).toBe(a)
  })

  // Immutability verification
  it('should prevent mutation of frozen object', () => {
    const obj = { a: 1 }
    deepFreeze(obj)
    expect(() => {
      obj.a = 2
    }).toThrow()
  })

  it('should prevent adding properties to frozen object', () => {
    const obj = { a: 1 }
    deepFreeze(obj)
    expect(() => {
      (obj as Record<string, unknown>).b = 2
    }).toThrow()
  })

  it('should prevent deleting properties from frozen object', () => {
    const obj = { a: 1 } as { a?: number }
    deepFreeze(obj)
    expect(() => {
      delete obj.a
    }).toThrow()
  })

  it('should prevent mutation of nested frozen object', () => {
    const obj = { nested: { value: 1 } }
    deepFreeze(obj)
    expect(() => {
      obj.nested.value = 2
    }).toThrow()
  })

  it('should prevent mutation of frozen array', () => {
    const arr = [1, 2, 3]
    deepFreeze(arr)
    expect(() => {
      arr[0] = 99
    }).toThrow()
  })

  it('should prevent mutating frozen array length', () => {
    const arr = [1, 2, 3]
    deepFreeze(arr)
    expect(() => {
      arr.push(4)
    }).toThrow()
  })
})