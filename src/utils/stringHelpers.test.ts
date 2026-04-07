import { describe, it, expect } from 'vitest'
import { reverseWords } from './stringHelpers'

describe('reverseWords', () => {
  it('reverses words in a normal string', () => {
    expect(reverseWords('hello world')).toBe('olleh dlrow')
  })

  it('returns empty string for empty input', () => {
    expect(reverseWords('')).toBe('')
  })

  it('reverses a single word', () => {
    expect(reverseWords('hello')).toBe('olleh')
  })

  it('preserves multiple spaces between words', () => {
    expect(reverseWords('hello   world')).toBe('olleh   dlrow')
  })

  it('handles strings with punctuation', () => {
    expect(reverseWords('hello, world!')).toBe(',olleh !dlrow')
  })

  it('handles single character', () => {
    expect(reverseWords('a')).toBe('a')
  })

  it('handles string with only spaces', () => {
    expect(reverseWords('   ')).toBe('   ')
  })

  it('preserves leading and trailing spaces', () => {
    expect(reverseWords('  hello world  ')).toBe('  olleh dlrow  ')
  })
})