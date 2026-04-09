import { describe, it, expect } from 'vitest'
import { toTitleCase } from './to-title-case'

describe('toTitleCase', () => {
  it('converts string to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
  })

  it('handles single word', () => {
    expect(toTitleCase('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(toTitleCase('')).toBe('')
  })

  it('handles already title cased string', () => {
    expect(toTitleCase('Hello World')).toBe('Hello World')
  })

  it('lowercases letters after first in each word', () => {
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
  })

  it('handles multiple spaces between words', () => {
    expect(toTitleCase('hello  world')).toBe('Hello  World')
  })

  it('handles single character words', () => {
    expect(toTitleCase('a b c')).toBe('A B C')
  })
})
