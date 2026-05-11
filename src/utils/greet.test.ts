import { describe, it, expect } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('greets with hello and the given name', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('handles empty string', () => {
    expect(greet('')).toBe('hello, ')
  })

  it('handles single word name', () => {
    expect(greet('alice')).toBe('hello, alice')
  })

  it('handles multi-word name', () => {
    expect(greet('john doe')).toBe('hello, john doe')
  })
})
