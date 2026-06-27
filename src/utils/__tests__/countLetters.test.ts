import { describe, it, expect } from 'vitest'
import { countLetters } from '../countLetters'

describe('countLetters', () => {
  it('returns 0 for empty string', () => {
    expect(countLetters('', 'a')).toBe(0)
  })

  it('returns 0 when letter is not present', () => {
    expect(countLetters('hello', 'z')).toBe(0)
  })

  it('returns correct count for multiple matches', () => {
    expect(countLetters('banana', 'a')).toBe(3)
  })

  it('returns 1 for single character input that matches', () => {
    expect(countLetters('a', 'a')).toBe(1)
  })

  it('is case-sensitive', () => {
    expect(countLetters('Hello', 'l')).toBe(2)
    expect(countLetters('Hello', 'L')).toBe(0)
  })
})
