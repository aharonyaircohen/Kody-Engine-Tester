import { describe, it, expect } from 'vitest'
import { omit } from './omit'

describe('omit', () => {
  it('should omit a single key from an object', () => {
    const input = { a: 1, b: 2, c: 3 }
    const expected = { a: 1, c: 3 }
    expect(omit(input, ['b'])).toEqual(expected)
  })

  it('should omit multiple keys from an object', () => {
    const input = { a: 1, b: 2, c: 3, d: 4 }
    const expected = { b: 2 }
    expect(omit(input, ['a', 'c', 'd'])).toEqual(expected)
  })

  it('should return a new object without modifying the original', () => {
    const input = { a: 1, b: 2, c: 3 }
    omit(input, ['b'])
    expect(input).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle an empty keys array', () => {
    const input = { a: 1, b: 2 }
    expect(omit(input, [])).toEqual({ a: 1, b: 2 })
  })

  it('should ignore non-existent keys', () => {
    const input: Record<string, number> = { a: 1, b: 2 }
    const expected = { a: 1, b: 2 }
    expect(omit(input, ['c', 'd'])).toEqual(expected)
  })

  it('should handle nested objects', () => {
    const input = { a: { nested: 'value' }, b: 2, c: { deep: { value: 1 } } }
    const expected = { b: 2 }
    expect(omit(input, ['a', 'c'])).toEqual(expected)
  })

  it('should handle objects with various value types', () => {
    const input = { a: 1, b: 'string', c: true, d: null, e: undefined, f: [1, 2, 3] }
    const expected = { a: 1, b: 'string', c: true, d: null, e: undefined }
    expect(omit(input, ['f'])).toEqual(expected)
  })

  it('should return an empty object when omitting all keys', () => {
    const input = { a: 1, b: 2 }
    expect(omit(input, ['a', 'b'])).toEqual({})
  })

  it('should handle empty object', () => {
    expect(omit({}, [])).toEqual({})
  })

  it('should preserve the original values of remaining keys', () => {
    const input: { x: { foo: string }; y: number[]; z: number } = { x: { foo: 'bar' }, y: [1, 2, 3], z: 42 }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = omit(input, ['z'])
    expect(result).toEqual({ x: { foo: 'bar' }, y: [1, 2, 3] })
  })

  it('should omit keys with empty string values', () => {
    const input: Record<string, string> = { a: '', b: 'hello', c: '' }
    const expected = { b: 'hello' }
    expect(omit(input, ['a', 'c'])).toEqual(expected)
  })

  it('should omit keys with zero values', () => {
    const input: Record<string, number> = { a: 0, b: 1, c: 0 }
    const expected = { b: 1 }
    expect(omit(input, ['a', 'c'])).toEqual(expected)
  })

  it('should omit keys with false values', () => {
    const input: Record<string, boolean> = { a: false, b: true, c: false }
    const expected = { b: true }
    expect(omit(input, ['a', 'c'])).toEqual(expected)
  })
})
