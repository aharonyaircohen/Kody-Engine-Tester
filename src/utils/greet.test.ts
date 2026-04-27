import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns hello, world for greet("world")', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
