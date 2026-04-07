import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic')
    expect(sanitizeInput('<div class="test">Content</div>')).toBe('Content')
    expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('')
    expect(sanitizeInput('<a href="http://evil.com">link</a>')).toBe('link')
  })

  it('leaves HTML entities as-is (no decoding)', () => {
    expect(sanitizeInput('Hello &amp; World')).toBe('Hello &amp; World')
    expect(sanitizeInput('&lt;script&gt;')).toBe('&lt;script&gt;')
    expect(sanitizeInput('&nbsp;')).toBe('&nbsp;')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  Hello  ')).toBe('Hello')
    expect(sanitizeInput('\tHello\n')).toBe('Hello')
    expect(sanitizeInput('  multiple   spaces  ')).toBe('multiple spaces')
  })

  it('normalizes unicode and strips diacritics', () => {
    expect(sanitizeInput('café')).toBe('cafe')
    expect(sanitizeInput('naïve')).toBe('naive')
    expect(sanitizeInput('résumé')).toBe('resume')
    expect(sanitizeInput('ñoño')).toBe('nono')
    expect(sanitizeInput('Ångström')).toBe('Angstrom')
  })

  it('handles mixed content with HTML and unicode', () => {
    expect(sanitizeInput('<b>Café</b>')).toBe('Cafe')
    expect(sanitizeInput('<p> naïve  </p>')).toBe('naive')
  })

  it('collapses multiple whitespace', () => {
    expect(sanitizeInput('Hello    World')).toBe('Hello World')
    expect(sanitizeInput('Hello\t\nWorld')).toBe('Hello World')
  })

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('handles null/undefined as falsy', () => {
    expect(sanitizeInput(null as unknown as string)).toBe('')
    expect(sanitizeInput(undefined as unknown as string)).toBe('')
  })

  it('handles string with only HTML and whitespace', () => {
    expect(sanitizeInput('   <div></div>   ')).toBe('')
    expect(sanitizeInput('<br/>')).toBe('')
  })

  it('preserves normal text', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World')
    expect(sanitizeInput('Simple text')).toBe('Simple text')
  })

  it('handles nested HTML tags', () => {
    expect(sanitizeInput('<div><p>Nested <b>content</b></p></div>')).toBe('Nested content')
  })

  it('handles self-closing tags', () => {
    expect(sanitizeInput('Hello<br/>World')).toBe('HelloWorld')
    expect(sanitizeInput('Line1<hr>Line2')).toBe('Line1Line2')
  })

  it('handles HTML with attributes', () => {
    expect(sanitizeInput('<a href="http://evil.com">link</a>')).toBe('link')
    expect(sanitizeInput('<img src="x" alt="test" />')).toBe('')
  })
})
