import { describe, it, expect } from 'vitest'
import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('capitalizes first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('handles already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles string with multiple words', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('handles all lowercase', () => {
    expect(capitalize('abc')).toBe('Abc')
  })

  it('handles all uppercase', () => {
    expect(capitalize('ABC')).toBe('ABC')
  })
})