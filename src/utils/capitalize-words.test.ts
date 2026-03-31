import { describe, it, expect } from 'vitest'
import { capitalizeWords } from './capitalize-words'

describe('capitalizeWords', () => {
  it('capitalizes first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World')
  })

  it('handles single word', () => {
    expect(capitalizeWords('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalizeWords('')).toBe('')
  })

  it('handles already capitalized words', () => {
    expect(capitalizeWords('Hello World')).toBe('Hello World')
  })

  it('lowercases letters after first in each word', () => {
    expect(capitalizeWords('HELLO WORLD')).toBe('Hello World')
  })

  it('handles multiple spaces between words', () => {
    expect(capitalizeWords('hello  world')).toBe('Hello  World')
  })

  it('handles single character words', () => {
    expect(capitalizeWords('a b c')).toBe('A B C')
  })
})