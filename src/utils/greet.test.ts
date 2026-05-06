import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns a greeting with the given name', () => {
    expect(greet('World')).toBe('Hello, World!')
  })

  it('works with an empty string', () => {
    expect(greet('')).toBe('Hello, !')
  })

  it('handles names with special characters', () => {
    expect(greet('John Doe')).toBe('Hello, John Doe!')
    expect(greet('María')).toBe('Hello, María!')
  })
})
