import { describe, it, expect } from 'vitest'
import { truncateOnce } from './truncate-once'

describe('truncateOnce', () => {
  it('truncates strings longer than maxLength to maxLength-3 + "..."', () => {
    expect(truncateOnce('Hello World', 8)).toBe('Hello...')
    expect(truncateOnce('Hello World', 5)).toBe('He...')
  })

  it('returns unchanged strings that are <= maxLength', () => {
    expect(truncateOnce('Hi', 5)).toBe('Hi')
    expect(truncateOnce('Hello', 10)).toBe('Hello')
    expect(truncateOnce('Hello', 5)).toBe('Hello')
  })

  it('returns "..." for any string when maxLength < 3', () => {
    expect(truncateOnce('Hello', 2)).toBe('...')
    expect(truncateOnce('Hi', 0)).toBe('...')
    expect(truncateOnce('A', 1)).toBe('...')
  })

  it('only truncates once — does not shorten already-truncated strings', () => {
    expect(truncateOnce('Hello...', 8)).toBe('Hello...')
    expect(truncateOnce('Hello...', 5)).toBe('Hello...')
    expect(truncateOnce('He...', 4)).toBe('He...')
  })

  it('handles empty string', () => {
    expect(truncateOnce('', 5)).toBe('')
    expect(truncateOnce('', 2)).toBe('...')
  })

  it('handles whitespace-only string', () => {
    expect(truncateOnce('     ', 10)).toBe('     ')
    expect(truncateOnce('     ', 3)).toBe('...')
  })

  it('handles string exactly at maxLength', () => {
    expect(truncateOnce('Hello', 5)).toBe('Hello')
    expect(truncateOnce('Hel', 3)).toBe('Hel')
  })

  it('handles maxLength of 3', () => {
    expect(truncateOnce('Hello World', 6)).toBe('Hel...')
    expect(truncateOnce('Hi', 3)).toBe('Hi')
  })
})