import { describe, it, expect } from 'vitest'
import { toCapitalCase } from './to-capital-case'

describe('toCapitalCase', () => {
  it('capitalizes first letter of each word', () => {
    expect(toCapitalCase('hello world')).toBe('Hello World')
  })

  it('handles single word', () => {
    expect(toCapitalCase('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(toCapitalCase('')).toBe('')
  })

  it('handles already capitalized words', () => {
    expect(toCapitalCase('Hello World')).toBe('Hello World')
  })

  it('lowercases letters after first in each word', () => {
    expect(toCapitalCase('HELLO WORLD')).toBe('Hello World')
  })

  it('handles mixed case input', () => {
    expect(toCapitalCase('hElLo WoRLd')).toBe('Hello World')
  })

  it('handles single character words', () => {
    expect(toCapitalCase('a b c')).toBe('A B C')
  })

  it('handles multiple spaces between words', () => {
    expect(toCapitalCase('hello  world')).toBe('Hello  World')
  })
})