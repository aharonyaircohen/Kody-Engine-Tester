import { describe, it, expect } from 'vitest'
import { compact } from './compact'

describe('compact', () => {
  it('should remove all falsy values from an array', () => {
    const input = [1, null, 2, undefined, 3, 0, 4, false, 5, '', 6, NaN]
    const expected = [1, 2, 3, 4, 5, 6]
    expect(compact(input)).toEqual(expected)
  })

  it('should return an empty array for empty input', () => {
    expect(compact([])).toEqual([])
  })

  it('should return the same array when there are no falsy values', () => {
    const input = [1, 2, 3, 4, 5]
    expect(compact(input)).toEqual([1, 2, 3, 4, 5])
  })

  it('should return an empty array when all values are falsy', () => {
    const input = [null, undefined, 0, false, '', NaN]
    expect(compact(input)).toEqual([])
  })

  it('should handle arrays with strings', () => {
    const input = ['hello', '', 'world', null, 'test', undefined]
    const expected = ['hello', 'world', 'test']
    expect(compact(input)).toEqual(expected)
  })

  it('should remove null values', () => {
    const input = [1, null, 2, null, 3]
    expect(compact(input)).toEqual([1, 2, 3])
  })

  it('should remove undefined values', () => {
    const input = [1, undefined, 2, undefined, 3]
    expect(compact(input)).toEqual([1, 2, 3])
  })

  it('should remove zero values', () => {
    const input = [1, 0, 2, 0, 3]
    expect(compact(input)).toEqual([1, 2, 3])
  })

  it('should remove false values', () => {
    const input = [true, false, 1, false, 2]
    expect(compact(input)).toEqual([true, 1, 2])
  })

  it('should remove empty string values', () => {
    const input = ['a', '', 'b', '', 'c']
    expect(compact(input)).toEqual(['a', 'b', 'c'])
  })

  it('should remove NaN values', () => {
    const input = [1, NaN, 2, NaN, 3]
    expect(compact(input)).toEqual([1, 2, 3])
  })

  it('should handle mixed types', () => {
    const input: (string | number | boolean | null | undefined)[] = [
      'hello',
      0,
      'world',
      null,
      1,
      undefined,
      true,
      false,
      'test',
      NaN,
    ]
    const expected = ['hello', 'world', 1, true, 'test']
    expect(compact(input)).toEqual(expected)
  })

  it('should handle arrays with objects', () => {
    const obj1 = { a: 1 }
    const obj2 = { b: 2 }
    const input: (typeof obj1 | null | undefined)[] = [obj1, null, obj2, undefined]
    expect(compact(input)).toEqual([obj1, obj2])
  })
})
