import { describe, it, expect } from 'vitest'
import { greet } from './greet'

describe('greet', () => {
  it('returns a greeting with the provided name', () => {
    expect(greet('Alice')).toBe('Hello, Alice!')
  })

  it('returns default greeting when name is empty', () => {
    expect(greet('')).toBe('Hello, world!')
  })

  it('returns default greeting when name is undefined', () => {
    expect(greet()).toBe('Hello, world!')
  })

  it('handles single character name', () => {
    expect(greet('A')).toBe('Hello, A!')
  })
})