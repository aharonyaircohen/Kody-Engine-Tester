import { describe, it, expect } from 'vitest'
import { reverseWords } from './reverse-words'

describe('reverseWords', () => {
  it('reverses a simple two-word string', () => {
    expect(reverseWords('hello world')).toBe('world hello')
  })

  it('reverses a multi-word string', () => {
    expect(reverseWords('the quick brown fox')).toBe('fox brown quick the')
  })

  it('reverses a single word', () => {
    expect(reverseWords('hello')).toBe('hello')
  })

  it('returns an empty string for empty input', () => {
    expect(reverseWords('')).toBe('')
  })

  it('reverses words with multiple spaces', () => {
    expect(reverseWords('hello   world')).toBe('world   hello')
  })
})
