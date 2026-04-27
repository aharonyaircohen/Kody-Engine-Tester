import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns "hello, world" for greet("world")', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('returns "hello, " concatenated with the name', () => {
    expect(greet('alice')).toBe('hello, alice')
    expect(greet('bob')).toBe('hello, bob')
  })

  it('handles empty string', () => {
    expect(greet('')).toBe('hello, ')
  })
})
