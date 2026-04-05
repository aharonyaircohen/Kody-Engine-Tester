import { describe, it, expect } from 'vitest'
import { truncateWords } from './truncate-words'

describe('truncateWords', () => {
  it('truncates a string to maxWords and appends suffix', () => {
    expect(truncateWords('Hello World', 1)).toBe('Hello...')
    expect(truncateWords('Hello World', 2)).toBe('Hello World')
    expect(truncateWords('Hello World Welcome', 2)).toBe('Hello World...')
  })

  it('returns string unchanged when word count is at or below maxWords', () => {
    expect(truncateWords('Hi', 5)).toBe('Hi')
    expect(truncateWords('Hello World', 2)).toBe('Hello World')
    expect(truncateWords('One Two Three', 3)).toBe('One Two Three')
  })

  it('uses custom suffix when provided', () => {
    expect(truncateWords('Hello World Welcome', 2, '___')).toBe('Hello World___')
    expect(truncateWords('One Two Three Four', 1, '>>>')).toBe('One>>>')
  })

  it('handles empty string', () => {
    expect(truncateWords('', 5)).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(truncateWords(null as unknown as string, 5)).toBe('')
    expect(truncateWords(undefined as unknown as string, 5)).toBe('')
  })

  it('handles whitespace-only string', () => {
    expect(truncateWords('     ', 10)).toBe('')
  })

  it('handles maxWords of zero', () => {
    expect(truncateWords('Hello World', 0)).toBe('...')
  })

  it('handles maxWords of one', () => {
    expect(truncateWords('Hello World', 1)).toBe('Hello...')
    expect(truncateWords('Hi', 1)).toBe('Hi')
  })

  it('handles negative maxWords', () => {
    expect(truncateWords('Hello World', -1)).toBe('Hello World')
  })

  it('handles single word at maxWords boundary', () => {
    expect(truncateWords('Hello', 1)).toBe('Hello')
    expect(truncateWords('Hello', 0)).toBe('...')
  })

  it('trims whitespace and splits correctly', () => {
    expect(truncateWords('  Hello   World   ', 1)).toBe('Hello...')
    expect(truncateWords('  Hello   World   ', 2)).toBe('Hello World')
  })
})
