import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('greets a name with hello', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
