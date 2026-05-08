import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns hello with the given name', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('handles different names', () => {
    expect(greet('alice')).toBe('hello, alice')
  })

  it('handles empty string', () => {
    expect(greet('')).toBe('hello, ')
  })
})
