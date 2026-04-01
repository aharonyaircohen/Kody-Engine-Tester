import { describe, it, expect } from 'vitest'
import { truncateText } from './truncateText'

describe('truncateText', () => {
  it('returns original text when shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello')
  })

  it('truncates text and appends \'...\' when exceeding maxLength', () => {
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

  it('uses custom suffix when provided', () => {
    expect(truncateText('Hello World', 5, ' [truncated]')).toBe('Hello [truncated]')
  })

  it('uses single character suffix', () => {
    expect(truncateText('Hello World', 5, '…')).toBe('Hello…')
  })

  it('returns original text with custom suffix when within maxLength', () => {
    expect(truncateText('Hi', 10, '...')).toBe('Hi')
  })

  it('handles string with single dollar sign', () => {
    expect(truncateText('Hello$World', 8)).toBe('Hello$Wo...')
  })

  it('handles string with multiple dollar signs', () => {
    expect(truncateText('$$$$$', 3)).toBe('$$$...')
  })

  it('handles string with dollar parenthesis pattern', () => {
    expect(truncateText('echo $(whoami)', 12)).toBe('echo $(whoam...')
  })

  it('handles string with template literal pattern', () => {
    expect(truncateText('Hello ${name}', 10)).toBe('Hello ${na...')
  })

  it('handles dollar signs in suffix', () => {
    expect(truncateText('Hello World', 5, '$')).toBe('Hello$')
  })
})
