import { describe, it, expect } from 'vitest'
import { capitalize } from './stringUtils'

describe('capitalize', () => {
  it('capitalizes the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('only capitalizes the first letter', () => {
    expect(capitalize('hello World')).toBe('Hello World')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('handles all lowercase', () => {
    expect(capitalize('abc')).toBe('Abc')
  })

  it('handles all uppercase', () => {
    expect(capitalize('ABC')).toBe('ABC')
  })
})