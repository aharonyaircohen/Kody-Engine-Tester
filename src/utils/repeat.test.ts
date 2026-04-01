import { describe, it, expect } from 'vitest'
import { repeat } from './repeat'

describe('repeat', () => {
  it('repeats a string n times', () => {
    expect(repeat('a', 3)).toBe('aaa')
  })

  it('repeats a multi-character string', () => {
    expect(repeat('ab', 3)).toBe('ababab')
  })

  it('returns empty string when times is 0', () => {
    expect(repeat('hello', 0)).toBe('')
  })

  it('returns the string once when times is 1', () => {
    expect(repeat('hello', 1)).toBe('hello')
  })

  it('returns empty string when input is empty', () => {
    expect(repeat('', 5)).toBe('')
  })

  it('throws error for negative times', () => {
    expect(() => repeat('a', -1)).toThrow('Times must be a non-negative number')
  })
})