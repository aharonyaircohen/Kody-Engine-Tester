import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns greeting with the given name', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('works with different names', () => {
    expect(greet('alice')).toBe('hello, alice')
    expect(greet('bob')).toBe('hello, bob')
  })
})
