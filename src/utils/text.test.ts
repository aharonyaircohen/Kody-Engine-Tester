import { describe, it, expect } from 'vitest'
import { toUpper } from './text'

describe('toUpper', () => {
  it('returns uppercase for simple string', () => {
    expect(toUpper('hello')).toBe('HELLO')
  })

  it('returns uppercase for already uppercase string', () => {
    expect(toUpper('HELLO')).toBe('HELLO')
  })

  it('handles mixed case string', () => {
    expect(toUpper('HeLLo WoRLD')).toBe('HELLO WORLD')
  })

  it('returns empty string for empty input', () => {
    expect(toUpper('')).toBe('')
  })

  it('returns empty string for null', () => {
    expect(toUpper(null as unknown as string)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(toUpper(undefined as unknown as string)).toBe('')
  })
})
