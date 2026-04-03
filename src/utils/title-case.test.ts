import { describe, it, expect } from 'vitest'
import { titleCase } from './title-case'

describe('titleCase', () => {
  it('capitalizes major words', () => {
    expect(titleCase('hello world')).toBe('Hello World')
  })

  it('leaves small words lowercase when in middle', () => {
    expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox')
    expect(titleCase('war and peace')).toBe('War and Peace')
    expect(titleCase('a tale of two cities')).toBe('A Tale of Two Cities')
  })

  it('capitalizes first word even if small', () => {
    expect(titleCase('the lord of the rings')).toBe('The Lord of the Rings')
  })

  it('capitalizes last word even if small', () => {
    expect(titleCase('romeo and juliet')).toBe('Romeo and Juliet')
  })

  it('handles single word', () => {
    expect(titleCase('hello')).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(titleCase('')).toBe('')
  })

  it('handles already capitalized words', () => {
    expect(titleCase('Hello World')).toBe('Hello World')
  })

  it('lowercases letters after first in each word', () => {
    expect(titleCase('HELLO WORLD')).toBe('Hello World')
  })

  it('handles multiple spaces between words', () => {
    expect(titleCase('hello  world')).toBe('Hello  World')
  })

  it('handles single character words', () => {
    expect(titleCase('a b c')).toBe('A B C')
  })

  it('handles mixed case small words', () => {
    expect(titleCase('THE LORD OF THE RINGS')).toBe('The Lord of the Rings')
  })
})