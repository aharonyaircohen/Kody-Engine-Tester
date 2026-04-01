import { describe, it, expect } from 'vitest'
import { levenshtein } from './levenshtein'

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('hello', 'hello')).toBe(0)
    expect(levenshtein('', '')).toBe(0)
    expect(levenshtein('a', 'a')).toBe(0)
  })

  it('returns the length of the longer string when one is empty', () => {
    expect(levenshtein('', 'hello')).toBe(5)
    expect(levenshtein('hello', '')).toBe(5)
    expect(levenshtein('', 'a')).toBe(1)
  })

  it('handles single character substitutions', () => {
    expect(levenshtein('a', 'b')).toBe(1)
    expect(levenshtein('abc', 'abd')).toBe(1)
  })

  it('handles single character insertions', () => {
    expect(levenshtein('abc', 'abcd')).toBe(1)
    expect(levenshtein('', 'a')).toBe(1)
  })

  it('handles single character deletions', () => {
    expect(levenshtein('abcd', 'abc')).toBe(1)
    expect(levenshtein('a', '')).toBe(1)
  })

  it('computes edit distance for completely different strings', () => {
    expect(levenshtein('abc', 'def')).toBe(3)
    expect(levenshtein('hello', 'world')).toBe(4)
  })

  it('handles case sensitivity', () => {
    expect(levenshtein('hello', 'HELLO')).toBe(5)
    expect(levenshtein('Hello', 'hello')).toBe(1)
  })

  it('handles whitespace', () => {
    expect(levenshtein('hello world', 'helloworld')).toBe(1)
    expect(levenshtein('hello world', 'hello world ')).toBe(1)
    expect(levenshtein('', ' ')).toBe(1)
  })

  it('handles unicode characters', () => {
    expect(levenshtein('café', 'cafe')).toBe(1)
    expect(levenshtein('naïve', 'naive')).toBe(1)
    expect(levenshtein('résumé', 'resume')).toBe(2)
  })

  it('handles repeated characters', () => {
    expect(levenshtein('aaa', 'aa')).toBe(1)
    expect(levenshtein('aaa', 'a')).toBe(2)
    expect(levenshtein('abab', 'baba')).toBe(2)
  })

  it('handles strings of different lengths', () => {
    expect(levenshtein('ab', 'abc')).toBe(1)
    expect(levenshtein('abc', 'ab')).toBe(1)
    expect(levenshtein('abc', 'abcd')).toBe(1)
    expect(levenshtein('abcd', 'abc')).toBe(1)
    expect(levenshtein('abc', 'abcdef')).toBe(3)
  })

  it('handles real-world examples', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('saturday', 'sunday')).toBe(3)
    expect(levenshtein('levenshtein', 'levenshtain')).toBe(1)
  })

  it('handles very short strings', () => {
    expect(levenshtein('', '')).toBe(0)
    expect(levenshtein('a', '')).toBe(1)
    expect(levenshtein('', 'a')).toBe(1)
    expect(levenshtein('a', 'b')).toBe(1)
  })
})
