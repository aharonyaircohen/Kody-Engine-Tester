import { describe, it, expect } from 'vitest'
import { leftPad } from './leftPad'

describe('leftPad', () => {
  it('pads string shorter than target length', () => {
    expect(leftPad('abc', 5, ' ')).toBe('  abc')
  })

  it('returns original string if already at target length', () => {
    expect(leftPad('abc', 3, ' ')).toBe('abc')
  })

  it('returns original string if longer than target length', () => {
    expect(leftPad('abcdef', 3, ' ')).toBe('abcdef')
  })

  it('uses custom pad character', () => {
    expect(leftPad('5', 3, '0')).toBe('005')
  })

  it('handles empty string', () => {
    expect(leftPad('', 3, '0')).toBe('000')
  })

  it('pads with multiple characters', () => {
    expect(leftPad('12', 6, '-')).toBe('----12')
  })

  it('handles single character string', () => {
    expect(leftPad('x', 4, '0')).toBe('000x')
  })

  it('handles string equal to target length with spaces', () => {
    expect(leftPad('abc', 3, ' ')).toBe('abc')
  })
})