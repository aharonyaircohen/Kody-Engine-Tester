import { describe, it, expect } from 'vitest'
import { mapKeys } from './map-keys'

describe('mapKeys', () => {
  it('should transform keys using a simple mapping function', () => {
    const input = { a: 1, b: 2, c: 3 }
    const expected = { A: 1, B: 2, C: 3 }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B' | 'C')).toEqual(expected)
  })

  it('should transform keys using index', () => {
    const input = { firstName: 'John', lastName: 'Doe' }
    const expected = { 0: 'John', 1: 'Doe' }
    expect(mapKeys(input, (_, __, index) => String(index) as '0' | '1')).toEqual(expected)
  })

  it('should return a new object without modifying the original', () => {
    const input = { a: 1, b: 2 }
    mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B')
    expect(input).toEqual({ a: 1, b: 2 })
  })

  it('should handle an empty object', () => {
    expect(mapKeys({}, (_, __, index) => `key_${index}` as `key_${number}`)).toEqual({})
  })

  it('should preserve all values unchanged', () => {
    const input = { a: { nested: 'value' }, b: [1, 2, 3], c: null, d: undefined, e: false }
    const expected = { A: { nested: 'value' }, B: [1, 2, 3], C: null, D: undefined, E: false }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E')).toEqual(expected)
  })

  it('should handle numeric values', () => {
    const input = { a: 0, b: 1, c: -1 }
    const expected = { A: 0, B: 1, C: -1 }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B' | 'C')).toEqual(expected)
  })

  it('should handle string values', () => {
    const input = { a: 'hello', b: '', c: 'world' }
    const expected = { A: 'hello', B: '', C: 'world' }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B' | 'C')).toEqual(expected)
  })

  it('should handle boolean values', () => {
    const input = { a: true, b: false }
    const expected = { A: true, B: false }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B')).toEqual(expected)
  })

  it('should handle array values', () => {
    const input = { a: [1, 2, 3], b: ['x', 'y'] }
    const expected = { A: [1, 2, 3], B: ['x', 'y'] }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B')).toEqual(expected)
  })

  it('should handle objects as values', () => {
    const input = { a: { x: 1 }, b: { y: 2 } }
    const expected = { A: { x: 1 }, B: { y: 2 } }
    expect(mapKeys(input, (_, key) => key.toUpperCase() as 'A' | 'B')).toEqual(expected)
  })

  it('should allow prefixing keys', () => {
    const input = { a: 1, b: 2 }
    const expected = { prefix_a: 1, prefix_b: 2 }
    expect(mapKeys(input, (_, key) => `prefix_${key}` as 'prefix_a' | 'prefix_b')).toEqual(expected)
  })

  it('should allow suffixing keys', () => {
    const input = { a: 1, b: 2 }
    const expected = { a_key: 1, b_key: 2 }
    expect(mapKeys(input, (_, key) => `${key}_key` as 'a_key' | 'b_key')).toEqual(expected)
  })

  it('should work with kebab-case transformation', () => {
    const input = { camelCase: 1, anotherKey: 2 }
    const expected = { 'camel-case': 1, 'another-key': 2 }
    expect(
      mapKeys(input, (_, key) => key.replace(/([A-Z])/g, '-$1').toLowerCase() as 'camel-case' | 'another-key')
    ).toEqual(expected)
  })

  it('should work with snake_case transformation', () => {
    const input = { camelCase: 1, anotherKey: 2 }
    const expected = { camel_case: 1, another_key: 2 }
    expect(
      mapKeys(input, (_, key) => key.replace(/([A-Z])/g, '_$1').toLowerCase() as 'camel_case' | 'another_key')
    ).toEqual(expected)
  })
})
