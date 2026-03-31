import { describe, it, expect } from 'vitest'
import { capitalizeWords } from './capitalize-words'

describe('capitalizeWords', () => {
  it('capitalizes the first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World')
  })

  it('capitalizes already capitalized words', () => {
    expect(capitalizeWords('Hello World')).toBe('Hello World')
  })

  it('handles single word', () => {
    expect(capitalizeWords('hello')).toBe('Hello')
  })

  it('returns empty string for empty input', () => {
    expect(capitalizeWords('')).toBe('')
  })

  it('handles multiple spaces between words', () => {
    expect(capitalizeWords('hello   world')).toBe('Hello   World')
  })

  it('handles all lowercase', () => {
    expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox')
  })

  it('handles mixed case', () => {
    expect(capitalizeWords('tHe QuIcK BrOwN fOx')).toBe('THe QuIcK BrOwN FOx')
  })
})