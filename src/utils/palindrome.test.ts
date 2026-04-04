import { describe, it, expect } from 'vitest'
import { palindrome } from './palindrome'

describe('palindrome', () => {
  it('returns true for a simple palindrome', () => {
    expect(palindrome('racecar')).toBe(true)
  })

  it('returns true for a palindrome with spaces', () => {
    expect(palindrome('race car')).toBe(true)
  })

  it('returns true for a palindrome with punctuation', () => {
    expect(palindrome("race, car!")).toBe(true)
  })

  it('returns true for a palindrome ignoring case', () => {
    expect(palindrome('RaceCar')).toBe(true)
  })

  it('returns true for a palindrome with mixed case and punctuation', () => {
    expect(palindrome('A man, a plan, a canal: Panama')).toBe(true)
  })

  it('returns false for a non-palindrome', () => {
    expect(palindrome('hello')).toBe(false)
  })

  it('returns true for an empty string', () => {
    expect(palindrome('')).toBe(true)
  })

  it('returns true for a single character', () => {
    expect(palindrome('a')).toBe(true)
  })

  it('returns true for a palindrome with numbers', () => {
    expect(palindrome('12321')).toBe(true)
  })

  it('returns true for a palindrome with spaces and numbers', () => {
    expect(palindrome('123 321')).toBe(true)
  })
})
