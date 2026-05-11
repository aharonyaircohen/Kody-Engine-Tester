import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns hello message with name', () => {
    expect(greet('world')).toBe('hello, world')
  })
})
