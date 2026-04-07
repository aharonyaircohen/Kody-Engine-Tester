import { describe, it, expect } from 'vitest'
import { truncateString } from './truncate-string'

describe('truncateString', () => {
  it('truncates a string longer than maxLength and appends ellipsis', () => {
    expect(truncateString('Hello World', 8)).toBe('Hello...')
    expect(truncateString('Hello World', 5)).toBe('He...')
    expect(truncateString('Hello World', 11)).toBe('Hello World')
  })

  it('returns string unchanged when shorter than maxLength', () => {
    expect(truncateString('Hi', 5)).toBe('Hi')
    expect(truncateString('Hello', 10)).toBe('Hello')
  })

  it('returns string unchanged when length equals maxLength', () => {
    expect(truncateString('Hello', 5)).toBe('Hello')
  })

  it('uses custom ellipsis when provided', () => {
    expect(truncateString('Hello World', 8, '___')).toBe('Hello___')
    expect(truncateString('Hello World', 5, '>>>')).toBe('He>>>')
    expect(truncateString('Hello World', 11, '...')).toBe('Hello World')
  })

  it('handles empty string', () => {
    expect(truncateString('', 5)).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(truncateString(null as unknown as string, 5)).toBe('')
    expect(truncateString(undefined as unknown as string, 5)).toBe('')
  })

  it('handles maxLength of zero', () => {
    expect(truncateString('Hello', 0)).toBe('...')
  })

  it('handles maxLength of one', () => {
    expect(truncateString('Hello', 1)).toBe('...')
    expect(truncateString('Hi', 1)).toBe('...')
  })

  it('handles maxLength equal to ellipsis length', () => {
    expect(truncateString('Hello', 3, '...')).toBe('...')
    expect(truncateString('Hi', 3, '...')).toBe('Hi')
  })

  it('handles maxLength less than ellipsis length', () => {
    expect(truncateString('Hello', 2, '...')).toBe('...')
  })

  it('handles negative maxLength', () => {
    expect(truncateString('Hello', -1)).toBe('Hello')
  })

  it('handles whitespace-only string', () => {
    expect(truncateString('     ', 10)).toBe('     ')
  })

  it('handles string with only spaces needing truncation', () => {
    expect(truncateString('     ', 3)).toBe('...')
  })

  it('handles ellipsis of different lengths', () => {
    expect(truncateString('Hello World', 10, '..')).toBe('Hello Wo..')
    // 'Hello World' is 11 chars, so with maxLength=12 it returns unchanged
    expect(truncateString('Hello World', 12, '~~')).toBe('Hello World')
    expect(truncateString('Hello World', 6, '-----')).toBe('H-----')
  })
})
