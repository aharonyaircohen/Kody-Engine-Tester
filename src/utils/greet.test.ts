import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns greeting with given name', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
