import { describe, it, expect } from 'vitest'
import { capitalizeFirst } from './capitalize-first'

describe('capitalizeFirst', () => {
  it('capitalizes first letter only', () => {
    expect(capitalizeFirst('hello world')).toBe('Hello world')
  })

  it('handles single word', () => {
    expect(capitalizeFirst('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(capitalizeFirst('')).toBe('')
  })

  it('handles already capitalized string', () => {
    expect(capitalizeFirst('Hello world')).toBe('Hello world')
  })

  it('handles all lowercase', () => {
    expect(capitalizeFirst('hello')).toBe('Hello')
  })

  it('handles all uppercase', () => {
    expect(capitalizeFirst('HELLO WORLD')).toBe('HELLO WORLD')
  })

  it('handles single character', () => {
    expect(capitalizeFirst('a')).toBe('A')
  })
})