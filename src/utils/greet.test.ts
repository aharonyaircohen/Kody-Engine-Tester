import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('greets world with hello', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('greets a custom name', () => {
    expect(greet('alice')).toBe('hello, alice')
  })
})
