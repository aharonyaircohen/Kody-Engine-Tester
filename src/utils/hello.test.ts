import { describe, expect, it } from 'vitest'

import { hello } from './hello'

describe('hello', () => {
  it('returns a greeting with the given name', () => {
    expect(hello('World')).toBe('Hello, World!')
    expect(hello('Claude')).toBe('Hello, Claude!')
  })

  it('handles empty string', () => {
    expect(hello('')).toBe('Hello, !')
  })
})
