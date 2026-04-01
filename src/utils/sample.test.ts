import { describe, it, expect } from 'vitest'
import { sample, sampleN } from './sample'

describe('sample', () => {
  it('should return undefined for empty array', () => {
    expect(sample([])).toBeUndefined()
  })

  it('should return the only element for single-element array', () => {
    expect(sample([42])).toBe(42)
  })

  it('should return an element from the array', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = sample(arr)
    expect(arr).toContain(result)
  })

  it('should not modify the original array', () => {
    const arr = [1, 2, 3]
    sample(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('sampleN', () => {
  it('should return empty array for empty input', () => {
    expect(sampleN([], 3)).toEqual([])
  })

  it('should return empty array for n <= 0', () => {
    expect(sampleN([1, 2, 3], 0)).toEqual([])
    expect(sampleN([1, 2, 3], -1)).toEqual([])
  })

  it('should return all elements if n >= array length', () => {
    const arr = [1, 2, 3]
    const result = sampleN(arr, 5)
    expect(result.length).toBe(3)
    expect(result).toEqual(expect.arrayContaining(arr))
  })

  it('should return exactly n elements when n < array length', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = sampleN(arr, 3)
    expect(result.length).toBe(3)
    result.forEach((item) => expect(arr).toContain(item))
  })

  it('should return unique elements (no replacement)', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = sampleN(arr, 5)
    const uniqueSet = new Set(result)
    expect(uniqueSet.size).toBe(result.length)
  })

  it('should not modify the original array', () => {
    const arr = [1, 2, 3, 4, 5]
    sampleN(arr, 3)
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })
})
