import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('greet("world") returns "hello, world"', () => {
    expect(greet("world")).toBe("hello, world")
  })
})
