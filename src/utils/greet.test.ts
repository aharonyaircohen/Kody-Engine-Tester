import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns "hello, world" for greet("world")', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('greets arbitrary names', () => {
    expect(greet('Alice')).toBe('hello, Alice')
  })

  it('handles empty string', () => {
    expect(greet('')).toBe('hello, ')
  })
})
