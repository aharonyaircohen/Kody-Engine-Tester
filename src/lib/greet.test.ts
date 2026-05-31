import { describe, expect, it } from 'vitest'

import { greet } from './greet'

describe('greet', () => {
  it('returns greeting with normal name', () => {
    expect(greet('World')).toBe('Hello, World!')
  })

  it('trims surrounding whitespace from name', () => {
    expect(greet('  Alice  ')).toBe('Hello, Alice!')
  })

  it('returns fallback for empty/whitespace name', () => {
    expect(greet('')).toBe('Hello, there!')
    expect(greet('   ')).toBe('Hello, there!')
  })
})
