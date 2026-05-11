import { describe, it, expect } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns "hello, world" when passed "world"', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
