import { describe, expect, it } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('greets world with hello, world', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
