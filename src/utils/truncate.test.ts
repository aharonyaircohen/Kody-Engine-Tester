import { describe, it, expect } from 'vitest'
import { truncate } from './truncate'

describe('truncate', () => {
  it('should return the string unchanged if shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('should return the string unchanged if exactly maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('should truncate and add "..." if string exceeds maxLength', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('should handle maxLength of 0', () => {
    expect(truncate('hello', 0)).toBe('...')
  })

  it('should handle maxLength equal to string length', () => {
    expect(truncate('abc', 3)).toBe('abc')
  })

  it('should handle single character truncation', () => {
    expect(truncate('ab', 1)).toBe('a...')
  })

  it('should handle long strings', () => {
    const long = 'a'.repeat(1000)
    const result = truncate(long, 10)
    expect(result).toBe('a'.repeat(10) + '...')
    expect(result.length).toBe(13)
  })
})
