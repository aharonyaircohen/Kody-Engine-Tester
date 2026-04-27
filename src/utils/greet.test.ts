import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('greets a name with hello', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('handles different names', () => {
    expect(greet('alice')).toBe('hello, alice')
    expect(greet('bob')).toBe('hello, bob')
  })

  it('handles empty string', () => {
    expect(greet('')).toBe('hello, ')
  })
})
