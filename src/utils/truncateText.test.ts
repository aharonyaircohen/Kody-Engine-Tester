import { describe, it, expect } from 'vitest'
import { truncateText } from './truncateText'

describe('truncateText', () => {
  it('returns original text when shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello')
  })

  it('truncates text and appends "..." when exceeding maxLength', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...')
  })

  it('handles exact maxLength (no truncation)', () => {
    expect(truncateText('Hello', 5)).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })

  it('returns empty string for maxLength <= 0', () => {
    expect(truncateText('Hello', 0)).toBe('')
    expect(truncateText('Hello', -1)).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(truncateText(null as unknown as string, 10)).toBe('')
    expect(truncateText(undefined as unknown as string, 10)).toBe('')
  })

  it('truncates single character when maxLength is 1', () => {
    expect(truncateText('Hello', 1)).toBe('H...')
  })

  it('truncates correctly for unicode characters', () => {
    expect(truncateText('こんにちは世界', 5)).toBe('こんにちは...')
  })

  it('truncates correctly when text length equals maxLength + 1', () => {
    expect(truncateText('abcdef', 5)).toBe('abcde...')
  })
})
