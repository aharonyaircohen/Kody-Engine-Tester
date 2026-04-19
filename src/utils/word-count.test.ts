import { describe, it, expect } from 'vitest'
import { wordCount } from './word-count'

describe('wordCount', () => {
  it('returns 0 for empty string', () => {
    expect(wordCount('')).toBe(0)
  })

  it('returns 1 for a single word', () => {
    expect(wordCount('hello')).toBe(1)
    expect(wordCount('x')).toBe(1)
  })

  it('returns correct count for multiple words', () => {
    expect(wordCount('Hello World')).toBe(2)
    expect(wordCount('one two three four five')).toBe(5)
  })

  it('ignores leading and trailing whitespace', () => {
    expect(wordCount('   hello')).toBe(1)
    expect(wordCount('hello   ')).toBe(1)
    expect(wordCount('   hello world   ')).toBe(2)
  })

  it('treats multiple consecutive whitespace as a single separator', () => {
    expect(wordCount('hello   world')).toBe(2)
    expect(wordCount('one    two   three')).toBe(3)
    expect(wordCount('a    b    c    d')).toBe(4)
  })

  it('counts words separated by newlines and tabs', () => {
    expect(wordCount('hello\nworld')).toBe(2)
    expect(wordCount('hello\tworld')).toBe(2)
    expect(wordCount('one\ttwo\nthree')).toBe(3)
    expect(wordCount('  one\t\n two  ')).toBe(2)
  })
})
