import { describe, it, expect } from 'vitest'
import { capitalize } from './string'

describe('capitalize', () => {
  it('capitalizes the first letter of a simple string', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('capitalizes already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('handles string with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })
})