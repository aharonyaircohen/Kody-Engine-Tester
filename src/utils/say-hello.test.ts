import { describe, it, expect } from 'vitest'
import { sayHello } from './say-hello'

describe('sayHello', () => {
  it('returns Hello, World! when given "World"', () => {
    expect(sayHello('World')).toBe('Hello, World!')
  })
})
