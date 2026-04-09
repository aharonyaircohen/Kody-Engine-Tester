import { describe, it, expect } from 'vitest'
import { stringPad } from './stringPad'

describe('stringPad', () => {
  it('pads string shorter than target length', () => {
    expect(stringPad('abc', 5, ' ')).toBe('abc  ')
  })

  it('returns original string if already at target length', () => {
    expect(stringPad('abc', 3, ' ')).toBe('abc')
  })

  it('returns original string if longer than target length', () => {
    expect(stringPad('abcdef', 3, ' ')).toBe('abcdef')
  })

  it('uses custom pad character', () => {
    expect(stringPad('5', 3, '0')).toBe('500')
  })

  it('handles empty string', () => {
    expect(stringPad('', 3, '0')).toBe('000')
  })

  it('pads with multiple characters', () => {
    expect(stringPad('12', 6, '-')).toBe('12----')
  })

  it('handles single character string', () => {
    expect(stringPad('x', 4, '0')).toBe('x000')
  })

  it('handles string equal to target length with spaces', () => {
    expect(stringPad('abc', 3, ' ')).toBe('abc')
  })
})