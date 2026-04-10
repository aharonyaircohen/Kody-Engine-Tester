import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('strips HTML tags but preserves inner content', () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello')
  })

  it('strips incomplete HTML tags', () => {
    expect(sanitizeInput('<b>Bold')).toBe('Bold')
    expect(sanitizeInput('Italic</i>')).toBe('Italic')
  })

  it('strips HTML tags but preserves inner content', () => {
    expect(sanitizeInput('<a href="http://evil.com">Link</a>Text')).toBe('LinkText')
    expect(sanitizeInput('<img src="x" onerror="alert(1)">Hello')).toBe('Hello')
  })

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
    expect(sanitizeInput('\thello\n')).toBe('hello')
    expect(sanitizeInput('\r\n  hello  \r\n')).toBe('hello')
  })

  it('normalizes unicode to NFC form', () => {
    // e + combining accent (decomposed) vs precomposed é
    const composed = 'café'
    const decomposed = 'cafe\u0301'
    expect(sanitizeInput(decomposed)).toBe(composed)
  })

  it('removes null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld')
  })

  it('returns empty string for input with only HTML and whitespace', () => {
    expect(sanitizeInput('   <div></div>   ')).toBe('')
  })

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('preserves normal text', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World')
  })

  it('handles mixed content', () => {
    expect(sanitizeInput('  <p>Hello</p>   world  ')).toBe('Hello   world')
  })
})
