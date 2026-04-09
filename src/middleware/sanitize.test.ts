import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
    expect(sanitizeInput('<b>bold</b>')).toBe('bold')
    expect(sanitizeInput('<p>paragraph</p>')).toBe('paragraph')
  })

  it('strips incomplete HTML tags', () => {
    expect(sanitizeInput('hello < world')).toBe('hello < world')
    expect(sanitizeInput('4 < 5')).toBe('4 < 5')
    expect(sanitizeInput('some <input>')).toBe('some')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
    expect(sanitizeInput('\thello\n')).toBe('hello')
    expect(sanitizeInput('  multiple   spaces  ')).toBe('multiple spaces')
  })

  it('normalizes unicode', () => {
    // NFC vs NFD forms of accented characters
    expect(sanitizeInput('café')).toBe('café')
    // Characters that look the same but are different code points
    expect(sanitizeInput('\u0041\u0301')).toBe('\u00C1') // Á
  })

  it('removes dangerous control characters', () => {
    expect(sanitizeInput('hello\u0000world')).toBe('helloworld')
    // Null character removed, but newlines/tabs converted to spaces
    expect(sanitizeInput('line1\u000Aline2')).toBe('line1 line2')
    expect(sanitizeInput('tab\u0009here')).toBe('tab here')
  })

  it('handles empty strings', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput('   ')).toBe('')
    expect(sanitizeInput('<>')).toBe('')
  })

  it('handles strings with only HTML-like content', () => {
    expect(sanitizeInput('<><><>')).toBe('')
    expect(sanitizeInput('</>')).toBe('')
  })

  it('collapses multiple whitespace characters', () => {
    expect(sanitizeInput('hello    world')).toBe('hello world')
    expect(sanitizeInput('a  b  c')).toBe('a b c')
  })

  it('preserves legitimate spaces in text', () => {
    expect(sanitizeInput('hello world')).toBe('hello world')
    expect(sanitizeInput('first middle last')).toBe('first middle last')
  })

  it('handles mixed content with HTML and text', () => {
    expect(sanitizeInput('<div>Hello</div> world')).toBe('Hello world')
    expect(sanitizeInput('Name: <b>John</b>, Age: 30')).toBe('Name: John, Age: 30')
  })

  it('handles strings with newlines and tabs', () => {
    expect(sanitizeInput('hello\nworld')).toBe('hello world')
    expect(sanitizeInput('hello\tworld')).toBe('hello world')
    expect(sanitizeInput('hello\rworld')).toBe('hello world')
  })

  it('handles unicode whitespace', () => {
    expect(sanitizeInput('\u2003hello\u2003')).toBe('hello') // em space
    expect(sanitizeInput('\u00A0hello\u00A0')).toBe('hello') // non-breaking space
  })
})