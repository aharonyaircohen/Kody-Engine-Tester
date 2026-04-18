import { describe, it, expect } from 'vitest'
import { capitalize } from './strings'

describe('capitalize', () => {
  it('uppercases the first character and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
    expect(capitalize('hElLo')).toBe('Hello')
  })

  it('handles a single character string', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('Z')).toBe('Z')
  })

  it('handles an empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles null and undefined as falsy', () => {
    expect(capitalize(null as unknown as string)).toBe('')
    expect(capitalize(undefined as unknown as string)).toBe('')
  })

  it('handles strings that are already sentence-cased', () => {
    expect(capitalize('Hello world')).toBe('Hello world')
  })

  it('handles mixed-case strings with spaces', () => {
    expect(capitalize('hELLO WORLD')).toBe('Hello world')
  })

  it('handles strings with numbers', () => {
    expect(capitalize('123abc')).toBe('123abc')
  })

  it('handles strings with special characters', () => {
    expect(capitalize('!hello')).toBe('!hello')
    expect(capitalize('@world')).toBe('@world')
  })
})
