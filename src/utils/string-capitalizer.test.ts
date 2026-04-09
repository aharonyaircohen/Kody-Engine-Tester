import { describe, it, expect } from 'vitest'
import { stringCapitalizer } from './string-capitalizer'

describe('stringCapitalizer', () => {
  it('capitalizes first letter of each word', () => {
    expect(stringCapitalizer('hello world')).toBe('Hello World')
  })

  it('handles single word', () => {
    expect(stringCapitalizer('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(stringCapitalizer('')).toBe('')
  })

  it('handles already capitalized words', () => {
    expect(stringCapitalizer('Hello World')).toBe('Hello World')
  })

  it('lowercases letters after first in each word', () => {
    expect(stringCapitalizer('HELLO WORLD')).toBe('Hello World')
  })

  it('handles multiple spaces between words', () => {
    expect(stringCapitalizer('hello  world')).toBe('Hello  World')
  })

  it('handles single character words', () => {
    expect(stringCapitalizer('a b c')).toBe('A B C')
  })
})