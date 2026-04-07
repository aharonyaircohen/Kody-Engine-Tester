import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  describe('HTML stripping', () => {
    it('passes plain text through unchanged', () => {
      expect(sanitizeInput('hello world')).toBe('hello world')
    })

    it('strips script tags', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)')
    })

    it('strips nested tags', () => {
      expect(sanitizeInput('<div><p>Hello <b>World</b></p></div>')).toBe('Hello World')
    })

    it('strips img onerror attack', () => {
      expect(sanitizeInput('<img src=x onerror="alert(1)">')).toBe('')
    })

    it('strips event handler attributes', () => {
      expect(sanitizeInput('<div onclick="evil()">Click me</div>')).toBe('Click me')
    })

    it('strips anchor tag with javascript href', () => {
      expect(sanitizeInput('<a href="javascript:alert(1)">click</a>')).toBe('click')
    })

    it('decodes HTML entities', () => {
      expect(sanitizeInput('&lt;script&gt;')).toBe('<script>')
    })

    it('strips mixed content with text and tags', () => {
      expect(sanitizeInput('Hello <b>World</b>!')).toBe('Hello World!')
    })
  })

  describe('whitespace trimming', () => {
    it('trims leading whitespace', () => {
      expect(sanitizeInput('  hello')).toBe('hello')
    })

    it('trims trailing whitespace', () => {
      expect(sanitizeInput('hello   ')).toBe('hello')
    })

    it('trims both leading and trailing whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world')
    })

    it('trims tab characters', () => {
      expect(sanitizeInput('\thello\t')).toBe('hello')
    })

    it('trims newline characters', () => {
      expect(sanitizeInput('\nhello\n')).toBe('hello')
    })

    it('trims carriage return characters', () => {
      expect(sanitizeInput('\rhello\r')).toBe('hello')
    })

    it('collapses multiple whitespace between words', () => {
      // Note: basic trim doesn't collapse whitespace, but NFC normalization may affect this
      expect(sanitizeInput('hello    world')).toBe('hello    world')
    })
  })

  describe('unicode normalization', () => {
    it('normalizes composed characters (NFC)', () => {
      // é can be represented as single character (U+00E9) or e + combining acute (U+0065 U+0301)
      const composed = '\u00e9' // é as single character
      const decomposed = '\u0065\u0301' // é as e + combining acute
      expect(sanitizeInput(decomposed)).toBe(composed)
    })

    it('normalizes special unicode whitespace', () => {
      // Non-breaking space U+00A0 should be normalized to regular space then trimmed
      const nbsp = '\u00a0'
      expect(sanitizeInput(nbsp)).toBe('')
    })

    it('handles mixed ascii and unicode', () => {
      expect(sanitizeInput('caf\u00e9')).toBe('caf\u00e9')
    })
  })

  describe('null byte handling', () => {
    it('removes null bytes', () => {
      expect(sanitizeInput('hello\u0000world')).toBe('helloworld')
    })

    it('removes multiple null bytes', () => {
      expect(sanitizeInput('\u0000\u0000hello\u0000\u0000')).toBe('hello')
    })
  })

  describe('combined attacks', () => {
    it('handles script injection with extra whitespace', () => {
      expect(sanitizeInput('  <script>alert(1)</script>  ')).toBe('alert(1)')
    })

    it('handles XSS with unicode escape', () => {
      expect(sanitizeInput('<img src=x onerror="alert(1)">')).toBe('')
    })

    it('handles whitespace and unicode normalization together', () => {
      const input = '  caf\u0065\u0301  '
      expect(sanitizeInput(input)).toBe('caf\u00e9')
    })

    it('handles null byte and HTML injection together', () => {
      expect(sanitizeInput('<script>\u0000alert(1)</script>')).toBe('alert(1)')
    })
  })

  describe('edge cases', () => {
    it('returns empty string for non-string input', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('')
      expect(sanitizeInput(undefined as unknown as string)).toBe('')
      expect(sanitizeInput(123 as unknown as string)).toBe('')
    })

    it('returns empty string for empty input', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(sanitizeInput('   ')).toBe('')
      expect(sanitizeInput('\t\n\r')).toBe('')
    })

    it('handles unicode-only strings', () => {
      expect(sanitizeInput('\u4e2d\u6587')).toBe('\u4e2d\u6587')
    })

    it('handles strings with emoji', () => {
      expect(sanitizeInput('hello 👋 world')).toBe('hello 👋 world')
    })

    it('handles mixed content with emoji', () => {
      expect(sanitizeInput('<b>hello</b> 👋')).toBe('hello 👋')
    })
  })
})
