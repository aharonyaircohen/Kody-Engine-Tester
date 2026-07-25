import { describe, expect, it } from 'vitest'

import { mode } from './numbers'

describe('mode', () => {
  it('returns an empty array for empty input', () => {
    expect(mode([])).toEqual([])
  })

  it('returns the single value when all elements are the same', () => {
    expect(mode([5, 5, 5])).toEqual([5])
  })

  it('returns the mode for a single mode (most frequent)', () => {
    expect(mode([1, 2, 3, 3, 4])).toEqual([3])
    expect(mode([1, 1, 2, 3, 4])).toEqual([1])
  })

  it('returns all modes when there is a tie (multi-modal)', () => {
    expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2])
    expect(mode([1, 1, 2, 2])).toEqual([1, 2])
  })

  it('returns all values when all values are unique (every value is a mode)', () => {
    expect(mode([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('returns modes in ascending order', () => {
    expect(mode([3, 1, 2, 1, 3, 2])).toEqual([1, 2, 3])
  })
})