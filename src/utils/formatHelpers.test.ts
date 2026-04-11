import { describe, it, expect } from 'vitest'
import { formatBytes, truncateMiddle } from './formatHelpers'

describe('formatBytes', () => {
  it('returns 0 B for zero', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('returns 0 B for negative values', () => {
    expect(formatBytes(-1)).toBe('0 B')
    expect(formatBytes(-100)).toBe('0 B')
  })

  it('returns 0 B for NaN', () => {
    expect(formatBytes(NaN)).toBe('0 B')
  })

  it('formats bytes in binary units by default', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  it('formats bytes in decimal units when decimal option is true', () => {
    expect(formatBytes(1000, { decimal: true })).toBe('1 KB')
    expect(formatBytes(1000000, { decimal: true })).toBe('1 MB')
    expect(formatBytes(1000000000, { decimal: true })).toBe('1 GB')
  })

  it('handles TB and PB ranges', () => {
    expect(formatBytes(1099511627776)).toBe('1 TB')
    expect(formatBytes(1125899906842624)).toBe('1 PB')
  })

  it('removes trailing zeros from fractional part', () => {
    expect(formatBytes(1024 * 2)).toBe('2 KB')
    expect(formatBytes(1024 * 3)).toBe('3 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(2048)).toBe('2 KB')
  })
})

describe('truncateMiddle', () => {
  it('returns string unchanged when shorter than maxLen', () => {
    expect(truncateMiddle('Hello', 10)).toBe('Hello')
    expect(truncateMiddle('Hi', 5)).toBe('Hi')
  })

  it('returns string unchanged when length equals maxLen', () => {
    expect(truncateMiddle('Hello', 5)).toBe('Hello')
  })

  it('truncates with ellipsis in the middle when string is longer than maxLen', () => {
    // maxLen=8: content=5, left=floor(5/2)=2, right=3 -> 'He...rld'
    expect(truncateMiddle('Hello World', 8)).toBe('He...rld')
    // maxLen=10: content=7, left=floor(7/2)=3, right=4 -> 'Hel...orld'
    expect(truncateMiddle('Hello World', 10)).toBe('Hel...orld')
    expect(truncateMiddle('Hello World', 11)).toBe('Hello World')
  })

  it('uses default ellipsis of three dots', () => {
    expect(truncateMiddle('Hello World', 8)).toBe('He...rld')
    // maxLen=5: contentLen=2, left=floor(2/2)=1, right=1 -> 'a...h'
    expect(truncateMiddle('abcdefgh', 5)).toBe('a...h')
  })

  it('uses custom ellipsis when provided', () => {
    // maxLen=8, ellipsis='___' (3), contentLen=5 -> left=2, right=3
    expect(truncateMiddle('Hello World', 8, '___')).toBe('He___rld')
    // maxLen=8, ellipsis='…' (1), contentLen=7 -> left=3, right=4
    expect(truncateMiddle('Hello World', 8, '…')).toBe('Hel…orld')
  })

  it('handles odd-length splits correctly', () => {
    // maxLen=7, contentLen=4, leftLen=2, rightLen=2
    expect(truncateMiddle('Hello World', 7)).toBe('He...ld')
    // maxLen=8, contentLen=5, leftLen=3, rightLen=2
    expect(truncateMiddle('Hello World', 8)).toBe('He...rld')
  })

  it('handles empty string', () => {
    expect(truncateMiddle('', 5)).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(truncateMiddle(null as unknown as string, 5)).toBe('')
    expect(truncateMiddle(undefined as unknown as string, 5)).toBe('')
  })

  it('handles maxLen of zero', () => {
    expect(truncateMiddle('Hello', 0)).toBe('')
  })

  it('handles negative maxLen', () => {
    expect(truncateMiddle('Hello', -1)).toBe('Hello')
  })

  it('handles maxLen equal to ellipsis length', () => {
    expect(truncateMiddle('Hello', 3)).toBe('...')
    // String fits within maxLen, return unchanged
    expect(truncateMiddle('Hi', 3)).toBe('Hi')
  })

  it('handles maxLen less than ellipsis length', () => {
    expect(truncateMiddle('Hello', 2, '...')).toBe('..')
    expect(truncateMiddle('Hello', 1, '...')).toBe('.')
  })

  it('handles single character strings', () => {
    expect(truncateMiddle('a', 5)).toBe('a')
    // String fits within maxLen, return unchanged
    expect(truncateMiddle('a', 1)).toBe('a')
  })

  it('handles two character strings', () => {
    expect(truncateMiddle('ab', 5)).toBe('ab')
    expect(truncateMiddle('ab', 2)).toBe('ab')
    // String fits within maxLen, return unchanged
    expect(truncateMiddle('ab', 3)).toBe('ab')
  })
})
