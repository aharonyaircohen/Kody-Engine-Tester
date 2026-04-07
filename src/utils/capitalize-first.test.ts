import { describe, it, expect } from 'vitest'
import { capitalizeFirstLetter } from './capitalize-first'

describe('capitalizeFirstLetter', () => {
  it('capitalizes first letter and lowercases rest', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
  })

  it('handles already capitalized string', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello')
  })

  it('lowerases letters after first', () => {
    expect(capitalizeFirstLetter('HELLO')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalizeFirstLetter('a')).toBe('A')
  })

  it('handles multiple words (capitalizes only first letter of entire string)', () => {
    expect(capitalizeFirstLetter('hello world')).toBe('Hello world')
  })
})
