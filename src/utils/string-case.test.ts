import { describe, it, expect } from 'vitest'
import { capitalize, titleCase } from './string-case'

describe('capitalize', () => {
  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('capitalizes single-word input', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('capitalizes already-capitalized input', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('leaves rest of string untouched (mixed-case input)', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
  })

  it('handles unicode-safe input', () => {
    expect(capitalize('école')).toBe('École')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })
})

describe('titleCase', () => {
  it('returns empty string for empty input', () => {
    expect(titleCase('')).toBe('')
  })

  it('capitalizes single-word input', () => {
    expect(titleCase('hello')).toBe('Hello')
  })

  it('capitalizes already-titlecased input', () => {
    expect(titleCase('Hello')).toBe('Hello')
  })

  it('lowercases all-caps input', () => {
    expect(titleCase('HELLO WORLD')).toBe('Hello World')
  })

  it('handles mixed-case input', () => {
    expect(titleCase('hELLO wORLD')).toBe('Hello World')
  })

  it('handles unicode-safe input', () => {
    expect(titleCase('école française')).toBe('École Française')
  })

  it('handles multi-word input', () => {
    expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox')
  })
})
