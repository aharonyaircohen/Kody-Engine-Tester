import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns hello with the given name', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('handles different names', () => {
    expect(greet('alice')).toBe('hello, alice')
    expect(greet('bob')).toBe('hello, bob')
  })
})
