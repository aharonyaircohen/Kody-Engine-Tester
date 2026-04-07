import { describe, it, expect } from 'vitest'
import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('capitalizes the first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('lowercases the rest of an already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello')
    expect(capitalize('HELLO')).toBe('Hello')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('A')).toBe('A')
  })

  it('handles string with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('handles mixed case string', () => {
    expect(capitalize('hElLo WoRlD')).toBe('Hello world')
  })
})