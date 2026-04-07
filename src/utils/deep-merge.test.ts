import { describe, it, expect } from 'vitest'
import { merge } from './deep-merge'

describe('merge', () => {
  it('should merge two flat objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const expected = { a: 1, b: 3, c: 4 }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should not mutate the original target object', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    merge(target, source)
    expect(target).toEqual({ a: 1, b: 2 })
  })

  it('should not mutate the original source object', () => {
    const target = { a: 1 }
    const source = { b: 2, c: 3 }
    merge(target, source)
    expect(source).toEqual({ b: 2, c: 3 })
  })

  it('should deeply merge nested objects', () => {
    const target = { a: { nested: 'value', extra: 1 } }
    const source = { a: { nested: 'updated', another: 2 } }
    const expected = { a: { nested: 'updated', extra: 1, another: 2 } }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should replace arrays instead of merging them', () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    expect(merge(target, source)).toEqual({ a: [4, 5] })
  })

  it('should handle empty objects', () => {
    const target = {}
    const source = { a: 1 }
    expect(merge(target, source)).toEqual({ a: 1 })
  })

  it('should handle source with empty object', () => {
    const target = { a: 1 }
    const source = {}
    expect(merge(target, source)).toEqual({ a: 1 })
  })

  it('should handle both target and source as empty objects', () => {
    expect(merge({}, {})).toEqual({})
  })

  it('should overwrite primitive values in target with source', () => {
    const target = { a: 1, b: 'string', c: true }
    const source = { a: 2, b: 'updated', c: false }
    const expected = { a: 2, b: 'updated', c: false }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should preserve target properties not in source', () => {
    const target = { a: 1, b: 2 }
    const source = { c: 3 }
    const expected = { a: 1, b: 2, c: 3 }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle deeply nested objects with multiple levels', () => {
    const target = { a: { b: { c: { d: 1 } } } }
    const source = { a: { b: { c: { e: 2 } } } }
    const expected = { a: { b: { c: { d: 1, e: 2 } } } }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle null values in target', () => {
    const target = { a: null }
    const source = { b: 1 }
    const expected = { a: null, b: 1 }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle null values in source', () => {
    const target = { a: 1 }
    const source = { a: null } as unknown as Partial<{ a: number }>
    expect(merge(target, source)).toEqual({ a: null })
  })

  it('should handle undefined values in source', () => {
    const target = { a: 1 }
    const source = { a: undefined } as unknown as Partial<{ a: number }>
    expect(merge(target, source)).toEqual({ a: 1 })
  })

  it('should handle mixed nested and flat properties', () => {
    const target = { flat: 1, nested: { a: 1, b: 2 } }
    const source = { flat: 2, nested: { b: 3, c: 4 } }
    const expected = { flat: 2, nested: { a: 1, b: 3, c: 4 } }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle objects with various value types', () => {
    const target = { a: 1, b: 'string', c: true, d: null }
    const source = { e: [1, 2, 3], f: { nested: 'value' } }
    const expected = { a: 1, b: 'string', c: true, d: null, e: [1, 2, 3], f: { nested: 'value' } }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle source properties overwriting nested target properties', () => {
    const target = { a: { b: 1 } }
    const source = { a: 2 }
    expect(merge(target, source)).toEqual({ a: 2 })
  })

  it('should handle target properties overwriting source nested properties', () => {
    const target = { a: 1 }
    const source = { a: { b: 2 } }
    const expected = { a: { b: 2 } }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle zero values in both objects', () => {
    const target = { a: 0, b: 0 }
    const source = { b: 1, c: 0 }
    const expected = { a: 0, b: 1, c: 0 }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle false values in both objects', () => {
    const target = { a: false, b: true }
    const source = { b: false, c: true }
    const expected = { a: false, b: false, c: true }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should handle empty string values', () => {
    const target = { a: '', b: 'hello' }
    const source = { a: 'world', c: '' }
    const expected = { a: 'world', b: 'hello', c: '' }
    expect(merge(target, source)).toEqual(expected)
  })

  it('should merge objects with Date values', () => {
    const date = new Date('2024-01-01')
    const target = { date }
    const source = { value: 1 }
    const result = merge(target, source)
    expect(result.date).toEqual(date)
    expect(result.value).toEqual(1)
  })

  it('should return the same reference when source is empty', () => {
    const target = { a: 1 }
    const source = {}
    const result = merge(target, source)
    expect(result).toEqual(target)
  })

  it('should handle source undefined values correctly', () => {
    const target = { a: { b: 1 } }
    const source = { a: undefined } as unknown as Partial<{ a: { b: number } }>
    expect(merge(target, source)).toEqual({ a: { b: 1 } })
  })

  it('should merge multiple levels of nested objects', () => {
    const target = { level1: { level2: { level3: { a: 1 } } } }
    const source = { level1: { level2: { level3: { b: 2 } } } }
    const expected = { level1: { level2: { level3: { a: 1, b: 2 } } } }
    expect(merge(target, source)).toEqual(expected)
  })
})
