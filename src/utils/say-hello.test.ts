import { describe, expect, it } from 'vitest'

import { sayHello } from './say-hello'

describe('sayHello', () => {
  it('returns "Hello, World!" when called with "World"', () => {
    expect(sayHello('World')).toBe('Hello, World!')
  })
})
