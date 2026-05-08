import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns "hello, world" for greet("world")', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('returns "hello, " for empty string', () => {
    expect(greet('')).toBe('hello, ')
  })

  it('handles single character', () => {
    expect(greet('a')).toBe('hello, a')
  })

  it('handles string with trailing whitespace', () => {
    expect(greet('world ')).toBe('hello, world ')
  })
})
