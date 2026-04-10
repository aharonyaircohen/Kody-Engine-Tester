import { describe, expect, it } from 'vitest'
import { levenshteinDistance, levenshteinSimilarity } from './levenshtein'

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0)
    expect(levenshteinDistance('', '')).toBe(0)
  })

  it('returns length difference for empty string comparisons', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
  })

  it('handles single character differences', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1) // substitution
    expect(levenshteinDistance('cat', 'cats')).toBe(1) // insertion
    expect(levenshteinDistance('cats', 'cat')).toBe(1) // deletion
  })

  it('calculates correct distance for completely different strings', () => {
    expect(levenshteinDistance('hello', 'world')).toBe(4)
  })

  it('calculates correct distance for kit筒 vs sitten', () => {
    // k[i]tten -> sitten: substitute k->s (1), i is already there
    // Actually: kitten -> sitten = 1 (substitute k with s)
    expect(levenshteinDistance('kitten', 'sitten')).toBe(1)
    expect(levenshteinDistance('sitten', 'sitting')).toBe(2) // substitute e->i (1), insert g (1)
  })
})

describe('levenshteinSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(levenshteinSimilarity('hello', 'hello')).toBe(1)
    expect(levenshteinSimilarity('', '')).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    expect(levenshteinSimilarity('', 'abc')).toBe(0)
    expect(levenshteinSimilarity('abc', '')).toBe(0)
  })

  it('returns fractional similarity for partial matches', () => {
    const similarity = levenshteinSimilarity('hello', 'hallo')
    expect(similarity).toBeGreaterThan(0)
    expect(similarity).toBeLessThan(1)
  })

  it('returns values between 0 and 1', () => {
    const testCases = [
      ['hello', 'hello'],
      ['hello', 'hallo'],
      ['hello', 'world'],
      ['kitten', 'sitten'],
      ['saturday', 'sunday'],
    ]
    for (const [a, b] of testCases) {
      const sim = levenshteinSimilarity(a, b)
      expect(sim).toBeGreaterThanOrEqual(0)
      expect(sim).toBeLessThanOrEqual(1)
    }
  })
})
