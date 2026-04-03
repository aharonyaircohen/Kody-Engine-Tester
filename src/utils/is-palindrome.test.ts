import { describe, it, expect } from 'vitest'
import { isPalindrome } from './is-palindrome'

describe('isPalindrome', () => {
  it('returns true for a simple palindrome', () => {
    expect(isPalindrome('racecar')).toBe(true)
  })

  it('returns true for a single character', () => {
    expect(isPalindrome('a')).toBe(true)
  })

  it('returns true for an empty string', () => {
    expect(isPalindrome('')).toBe(true)
  })

  it('returns false for a non-palindrome', () => {
    expect(isPalindrome('hello')).toBe(false)
  })

  it('returns false for a different palindrome-like string', () => {
    expect(isPalindrome('world')).toBe(false)
  })
})
