import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns hello message with the given name', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
