import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns a greeting for a given name', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
