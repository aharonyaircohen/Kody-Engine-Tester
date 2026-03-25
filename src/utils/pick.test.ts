import { describe, it, expect } from 'vitest'
import { pick } from './pick'

describe('pick', () => {
  it('should return a new object with only the specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })

  it('should return an empty object when keys array is empty', () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({})
  })

  it('should ignore keys that do not exist on the object', () => {
    const obj = { a: 1, b: 2 }
    expect(pick(obj, ['a', 'z' as keyof typeof obj])).toEqual({ a: 1 })
  })

  it('should not mutate the original object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    pick(obj, ['a'])
    expect(obj).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle all keys present', () => {
    const obj = { x: 10, y: 20 }
    expect(pick(obj, ['x', 'y'])).toEqual({ x: 10, y: 20 })
  })

  it('should handle object with various value types', () => {
    const obj = { a: 'hello', b: 42, c: true, d: null }
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 'hello', c: true })
  })

  it('should return a new object reference, not the original', () => {
    const obj = { a: 1 }
    const result = pick(obj, ['a'])
    expect(result).not.toBe(obj)
    expect(result).toEqual({ a: 1 })
  })

  it('should handle an empty source object', () => {
    const obj = {} as Record<string, number>
    expect(pick(obj, [])).toEqual({})
  })
})
