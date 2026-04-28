import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('greets with hello and the given name', () => {
    expect(greet("world")).toBe("hello, world")
  })

  it('greets with different names', () => {
    expect(greet("alice")).toBe("hello, alice")
    expect(greet("bob")).toBe("hello, bob")
  })

  it('handles empty string', () => {
    expect(greet("")).toBe("hello, ")
  })
})
