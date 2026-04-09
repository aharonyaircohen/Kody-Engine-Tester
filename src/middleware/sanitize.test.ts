import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitize'

describe('sanitizeInput', () => {
  describe('HTML stripping', () => {
    it('strips simple HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
    })

    it('strips nested HTML tags', () => {
      expect(sanitizeInput('<div><p>Hello <strong>World</strong></p></div>')).toBe('Hello World')
    })

    it('strips HTML tags with attributes', () => {
      expect(sanitizeInput('<a href="javascript:alert(1)">click</a>')).toBe('click')
    })

    it('strips incomplete HTML tags', () => {
      expect(sanitizeInput('Hello < World')).toBe('Hello < World')
    })

    it('strips self-closing tags', () => {
      expect(sanitizeInput('Hello<br/>World')).toBe('HelloWorld')
    })

    it('handles input with only HTML tags', () => {
      expect(sanitizeInput('<br>')).toBe('')
    })
  })

  describe('whitespace handling', () => {
    it('trims leading whitespace', () => {
      expect(sanitizeInput('  hello')).toBe('hello')
    })

    it('trims trailing whitespace', () => {
      expect(sanitizeInput('hello  ')).toBe('hello')
    })

    it('trims both leading and trailing whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world')
    })

    it('collapses internal whitespace', () => {
      expect(sanitizeInput('hello    world')).toBe('hello    world')
    })

    it('handles tabs and newlines as whitespace', () => {
      expect(sanitizeInput('\t\nhello\n\t')).toBe('hello')
    })
  })

  describe('unicode normalization', () => {
    it('normalizes accented characters', () => {
      expect(sanitizeInput('café')).toBe('cafe')
    })

    it('normalizes multiple accented characters', () => {
      expect(sanitizeInput('naïve résumé')).toBe('naive resume')
    })

    it('preserves unicode ligatures (NFD does not decompose them)', () => {
      expect(sanitizeInput('ﬁnal')).toBe('ﬁnal')
    })

    it('normalizes non-ASCII characters', () => {
      expect(sanitizeInput('日本语')).toBe('日本语')
    })

    it('handles mixed ASCII and unicode', () => {
      expect(sanitizeInput('Café résumé ★')).toBe('Cafe resume ★')
    })
  })

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(sanitizeInput('   ')).toBe('')
    })

    it('handles null-like input', () => {
      expect(sanitizeInput(undefined as unknown as string)).toBe('')
    })

    it('handles input with HTML entities', () => {
      expect(sanitizeInput('Hello &amp; World')).toBe('Hello &amp; World')
    })

    it('handles input with newlines', () => {
      expect(sanitizeInput('line1\nline2\nline3')).toBe('line1\nline2\nline3')
    })
  })

  describe('combined operations', () => {
    it('sanitizes HTML with leading/trailing whitespace', () => {
      expect(sanitizeInput('  <p>Hello</p>  ')).toBe('Hello')
    })

    it('sanitizes HTML with unicode', () => {
      expect(sanitizeInput('<span>café</span>')).toBe('cafe')
    })

    it('handles real-world XSS attempt', () => {
      expect(sanitizeInput("  <script>alert('xss')</script>  ")).toBe("alert('xss')")
    })
  })
})
