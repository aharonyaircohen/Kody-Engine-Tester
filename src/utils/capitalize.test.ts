import { describe, it, expect } from 'vitest'
import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('capitalizes first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello')
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

  it('lower-cases letters after first', () => {
    expect(capitalize('HELLO')).toBe('HELLO')
  })

  it('handles multi-word string', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })
})