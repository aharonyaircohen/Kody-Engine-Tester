import { describe, it, expect } from 'vitest'
import { truncate } from './truncate'

describe('truncate', () => {
  it('truncates a string longer than maxLen and appends suffix', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...')
    expect(truncate('Hello World', 5)).toBe('He...')
    expect(truncate('Hello World', 11)).toBe('Hello World')
  })

  it('returns string unchanged when shorter than maxLen', () => {
    expect(truncate('Hi', 5)).toBe('Hi')
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('returns string unchanged when length equals maxLen', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('uses custom suffix when provided', () => {
    expect(truncate('Hello World', 8, '___')).toBe('Hello___')
    expect(truncate('Hello World', 5, '>>>')).toBe('He>>>')
    expect(truncate('Hello World', 11, '...')).toBe('Hello World')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(truncate(null as unknown as string, 5)).toBe('')
    expect(truncate(undefined as unknown as string, 5)).toBe('')
  })

  it('handles maxLen of zero', () => {
    expect(truncate('Hello', 0)).toBe('...')
  })

  it('handles maxLen of one', () => {
    expect(truncate('Hello', 1)).toBe('...')
    expect(truncate('Hi', 1)).toBe('...')
  })

  it('handles maxLen equal to suffix length', () => {
    expect(truncate('Hello', 3, '...')).toBe('...')
    expect(truncate('Hi', 3, '...')).toBe('Hi')
  })

  it('handles maxLen less than suffix length', () => {
    expect(truncate('Hello', 2, '...')).toBe('...')
  })

  it('handles negative maxLen', () => {
    expect(truncate('Hello', -1)).toBe('Hello')
  })

  it('handles whitespace-only string', () => {
    expect(truncate('     ', 10)).toBe('     ')
  })

  it('handles string with only spaces needing truncation', () => {
    expect(truncate('     ', 3)).toBe('...')
  })
})