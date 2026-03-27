import { describe, it, expect } from 'vitest'
import { pick } from './pick'

describe('pick', () => {
  it('should pick a single key from an object', () => {
    const input = { a: 1, b: 2, c: 3 }
    const expected = { b: 2 }
    expect(pick(input, ['b'])).toEqual(expected)
  })

  it('should pick multiple keys from an object', () => {
    const input = { a: 1, b: 2, c: 3, d: 4 }
    const expected = { a: 1, c: 3 }
    expect(pick(input, ['a', 'c'])).toEqual(expected)
  })

  it('should return a new object without modifying the original', () => {
    const input = { a: 1, b: 2, c: 3 }
    pick(input, ['a', 'b'])
    expect(input).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle an empty keys array', () => {
    const input = { a: 1, b: 2 }
    expect(pick(input, [])).toEqual({})
  })

  it('should ignore non-existent keys', () => {
    const input = { a: 1, b: 2 }
    const keys: ('a' | 'b')[] = ['a', 'b']
    const expected = { a: 1, b: 2 }
    expect(pick(input, keys)).toEqual(expected)
  })

  it('should handle nested objects', () => {
    const input = { a: { nested: 'value' }, b: 2, c: { deep: { value: 1 } } }
    const expected = { a: { nested: 'value' }, c: { deep: { value: 1 } } }
    expect(pick(input, ['a', 'c'])).toEqual(expected)
  })

  it('should handle objects with various value types', () => {
    const input = { a: 1, b: 'string', c: true, d: null, e: undefined, f: [1, 2, 3] }
    const expected = { a: 1, b: 'string', c: true, d: null, e: undefined }
    expect(pick(input, ['a', 'b', 'c', 'd', 'e'])).toEqual(expected)
  })

  it('should return an empty object when picking no existing keys', () => {
    const input = { a: 1, b: 2 }
    expect(pick(input, ['c', 'd'] as unknown as ('a' | 'b')[])).toEqual({})
  })

  it('should handle empty object', () => {
    expect(pick({}, [])).toEqual({})
  })

  it('should preserve the original values of picked keys', () => {
    const input: { x: { foo: string }; y: number[]; z: number } = { x: { foo: 'bar' }, y: [1, 2, 3], z: 42 }
    const result = pick(input, ['x', 'y'])
    expect(result).toEqual({ x: { foo: 'bar' }, y: [1, 2, 3] })
  })

  it('should pick keys with empty string values', () => {
    const input: Record<string, string> = { a: '', b: 'hello', c: '' }
    const expected = { a: '', b: 'hello', c: '' }
    expect(pick(input, ['a', 'b', 'c'])).toEqual(expected)
  })

  it('should pick keys with zero values', () => {
    const input: Record<string, number> = { a: 0, b: 1, c: 0 }
    const expected = { a: 0, b: 1, c: 0 }
    expect(pick(input, ['a', 'b', 'c'])).toEqual(expected)
  })

  it('should pick keys with false values', () => {
    const input: Record<string, boolean> = { a: false, b: true, c: false }
    const expected = { a: false, b: true, c: false }
    expect(pick(input, ['a', 'b', 'c'])).toEqual(expected)
  })
})
