import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('greets with hello prefix', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
