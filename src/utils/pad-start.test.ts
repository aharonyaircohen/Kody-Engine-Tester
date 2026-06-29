import { describe, it, expect } from 'vitest'
import { padStart } from './pad-start'

describe('padStart', () => {
  it('pads string shorter than target length', () => {
    expect(padStart('abc', 5, ' ')).toBe('  abc')
  })

  it('returns original string if already at target length', () => {
    expect(padStart('abc', 3, ' ')).toBe('abc')
  })

  it('returns original string if longer than target length', () => {
    expect(padStart('abcdef', 3, ' ')).toBe('abcdef')
  })

  it('uses custom pad character', () => {
    expect(padStart('5', 3, '0')).toBe('005')
  })

  it('handles empty string', () => {
    expect(padStart('', 3, '0')).toBe('000')
  })

  it('pads with multiple characters', () => {
    expect(padStart('12', 6, '-')).toBe('----12')
  })

  it('handles single character string', () => {
    expect(padStart('x', 4, '0')).toBe('000x')
  })

  it('handles string equal to target length with spaces', () => {
    expect(padStart('abc', 3, ' ')).toBe('abc')
  })

  it('pads with multi-char padChar and exact length match', () => {
    expect(padStart('1', 4, 'ab')).toBe('aba1')
  })

  it('pads with multi-char padChar shorter than padChar length', () => {
    expect(padStart('7', 3, 'xy')).toBe('xy7')
  })

  it('result length equals targetLength with multi-char padChar', () => {
    const result = padStart('abc', 7, 'xy')
    expect(result).toBe('xyxyabc')
    expect(result.length).toBe(7)
  })
})
