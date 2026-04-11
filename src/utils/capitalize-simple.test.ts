import { describe, it, expect } from 'vitest'
import { capitalizeSimple } from './capitalize-simple'

describe('capitalizeSimple', () => {
  it('capitalizes the first letter of a simple string', () => {
    expect(capitalizeSimple('hello')).toBe('Hello')
  })

  it('capitalizes already capitalized string', () => {
    expect(capitalizeSimple('Hello')).toBe('Hello')
  })

  it('handles single character', () => {
    expect(capitalizeSimple('a')).toBe('A')
  })

  it('handles string with spaces', () => {
    expect(capitalizeSimple('hello world')).toBe('Hello world')
  })
})
