import { describe, it, expect } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns "hello, world" when passed "world"', () => {
    expect(greet('world')).toBe('hello, world')
  })

  it('returns empty string for empty input', () => {
    expect(greet('')).toBe('')
  })

  it('handles single character', () => {
    expect(greet('a')).toBe('hello, a')
  })

  it('handles string with spaces', () => {
    expect(greet('hello world')).toBe('hello, hello world')
  })

  it('handles already greeted input', () => {
    expect(greet('hello, world')).toBe('hello, hello, world')
  })
})
