import { describe, it, expect } from 'vitest'
import { omit } from './omit'

describe('omit', () => {
  it('should return a new object without the specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 })
  })

  it('should return a copy of the object when keys array is empty', () => {
    const obj = { a: 1, b: 2 }
    expect(omit(obj, [])).toEqual({ a: 1, b: 2 })
  })

  it('should ignore keys that do not exist on the object', () => {
    const obj = { a: 1, b: 2 }
    expect(omit(obj, ['z' as keyof typeof obj])).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate the original object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    omit(obj, ['a'])
    expect(obj).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle excluding all keys', () => {
    const obj = { x: 10, y: 20 }
    expect(omit(obj, ['x', 'y'])).toEqual({})
  })

  it('should handle object with various value types', () => {
    const obj = { a: 'hello', b: 42, c: true, d: null }
    expect(omit(obj, ['b', 'd'])).toEqual({ a: 'hello', c: true })
  })

  it('should return a new object reference, not the original', () => {
    const obj = { a: 1, b: 2 }
    const result = omit(obj, ['a'])
    expect(result).not.toBe(obj)
    expect(result).toEqual({ b: 2 })
  })

  it('should handle an empty source object', () => {
    const obj = {} as Record<string, number>
    expect(omit(obj, ['a'])).toEqual({})
  })

  it('should not include inherited prototype properties', () => {
    const proto = { inherited: true }
    const obj = Object.create(proto)
    obj.own = 1
    obj.removed = 2
    const result = omit(obj, ['removed'])
    expect(result).toEqual({ own: 1 })
    expect(result).not.toHaveProperty('inherited')
  })

  it('should handle duplicate keys gracefully', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(omit(obj, ['a', 'a'])).toEqual({ b: 2, c: 3 })
  })
})
