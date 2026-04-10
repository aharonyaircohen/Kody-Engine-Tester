import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello')
    expect(sanitizeInput('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic')
    expect(sanitizeInput('<p>Paragraph</p>')).toBe('Paragraph')
    expect(sanitizeInput('No tags')).toBe('No tags')
  })

  it('strips HTML tags with attributes', () => {
    expect(sanitizeInput('<a href="http://evil.com">Link</a>')).toBe('Link')
    expect(sanitizeInput('<div class="foo" onclick="alert(1)">Content</div>')).toBe('Content')
    expect(sanitizeInput('<img src="x" onerror="evil()">')).toBe('')
  })

  it('normalizes unicode diacritics', () => {
    expect(sanitizeInput('café')).toBe('cafe')
    expect(sanitizeInput('naïve')).toBe('naive')
    expect(sanitizeInput('résumé')).toBe('resume')
    expect(sanitizeInput('ñoño')).toBe('nono')
    expect(sanitizeInput('Mötley')).toBe('Motley')
  })

  it('normalizes unicode while stripping HTML', () => {
    expect(sanitizeInput('<b>café</b>')).toBe('cafe')
    expect(sanitizeInput('naïve <script>')).toBe('naive')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
    expect(sanitizeInput('\thello\n')).toBe('hello')
    expect(sanitizeInput('  multiple   spaces  ')).toBe('multiple   spaces')
  })

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('handles string with only whitespace', () => {
    expect(sanitizeInput('   ')).toBe('')
    expect(sanitizeInput('\t\n')).toBe('')
  })

  it('handles string with only HTML', () => {
    expect(sanitizeInput('<div></div>')).toBe('')
    expect(sanitizeInput('<br/>')).toBe('')
    expect(sanitizeInput('<!-- comment -->')).toBe('')
  })

  it('preserves normal alphanumeric characters', () => {
    expect(sanitizeInput('Hello World 123')).toBe('Hello World 123')
    expect(sanitizeInput('Test-123_456.test')).toBe('Test-123_456.test')
  })

  it('handles mixed content', () => {
    expect(sanitizeInput('  <b>Hello</b>   World  ')).toBe('Hello   World')
    expect(sanitizeInput('\t<em>café</em>\n')).toBe('cafe')
  })
})
