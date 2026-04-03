import { describe, it, expect } from 'vitest'
import { stringCapitalize } from './string-capitalize'

describe('stringCapitalize', () => {
  it('capitalizes first letter of string', () => {
    expect(stringCapitalize('hello world')).toBe('Hello world')
  })

  it('handles single word', () => {
    expect(stringCapitalize('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(stringCapitalize('')).toBe('')
  })

  it('handles already capitalized string', () => {
    expect(stringCapitalize('Hello world')).toBe('Hello world')
  })

  it('does not affect letters after first', () => {
    expect(stringCapitalize('HELLO WORLD')).toBe('HELLO WORLD')
  })

  it('handles single character', () => {
    expect(stringCapitalize('a')).toBe('A')
  })
})
