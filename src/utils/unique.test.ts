import { describe, it, expect } from 'vitest'
import { unique } from './unique'

describe('unique', () => {
  it('should return an empty array for empty input', () => {
    expect(unique([])).toEqual([])
  })

  it('should remove duplicate numbers', () => {
    expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
  })

  it('should remove duplicate strings', () => {
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('should return same array if no duplicates', () => {
    expect(unique([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('should preserve order of first occurrence', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
  })
})
