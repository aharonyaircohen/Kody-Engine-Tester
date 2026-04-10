import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
  })

  it('strips incomplete HTML tags', () => {
    expect(sanitizeInput('<b>hello')).toBe('hello')
    expect(sanitizeInput('hello</b>')).toBe('hello')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
    expect(sanitizeInput('\thello\n')).toBe('hello')
  })

  it('normalizes unicode to NFC form', () => {
    // é in composed form (NFC)
    expect(sanitizeInput('é')).toBe('é')
    // é in decomposed form (NFD) - é = e + combining accent
    expect(sanitizeInput('é')).toBe('é')
  })

  it('handles mixed content', () => {
    expect(sanitizeInput('  <p>hello</p>  world  ')).toBe('hello  world')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput('' as unknown as string)).toBe('')
  })

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('preserves normal text', () => {
    expect(sanitizeInput('hello world')).toBe('hello world')
  })

  it('handles unicode characters', () => {
    expect(sanitizeInput('héllo wörld')).toBe('héllo wörld')
  })

  it('strips HTML attributes', () => {
    expect(sanitizeInput('<a href="javascript:alert(1)">click</a>')).toBe('click')
  })

  it('handles nested tags', () => {
    expect(sanitizeInput('<div><p>nested</p></div>')).toBe('nested')
  })
})
