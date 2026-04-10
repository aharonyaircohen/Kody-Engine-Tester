import { describe, expect, it } from 'vitest'

import { decode, encode } from './base64url'

describe('base64url', () => {
  describe('encode', () => {
    it('encodes a simple string', () => {
      expect(encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ')
    })

    it('encodes unicode characters correctly', () => {
      expect(encode('你好')).toBe('5L2g5aW9')
    })

    it('encodes emoji correctly via roundtrip', () => {
      expect(decode(encode('👋'))).toBe('👋')
    })

    it('encodes Hebrew characters correctly via roundtrip', () => {
      expect(decode(encode('שלום'))).toBe('שלום')
    })

    it('returns empty string for empty input', () => {
      expect(encode('')).toBe('')
    })

    it('produces URL-safe output without +, /, or =', () => {
      const result = encode('abc+def/ghi==')
      expect(result).not.toContain('+')
      expect(result).not.toContain('/')
      expect(result).not.toContain('=')
    })
  })

  describe('decode', () => {
    it('decodes a simple string', () => {
      expect(decode('SGVsbG8sIFdvcmxkIQ')).toBe('Hello, World!')
    })

    it('decodes unicode characters correctly', () => {
      expect(decode('5L2g5aW9')).toBe('你好')
    })

    it('decodes emoji correctly via roundtrip', () => {
      const encoded = encode('👋')
      expect(decode(encoded)).toBe('👋')
    })

    it('decodes Hebrew characters correctly via roundtrip', () => {
      const encoded = encode('שלום')
      expect(decode(encoded)).toBe('שלום')
    })

    it('returns empty string for empty input', () => {
      expect(decode('')).toBe('')
    })
  })

  describe('roundtrip', () => {
    it('encode then decode returns original string', () => {
      const original = 'Hello, World!'
      expect(decode(encode(original))).toBe(original)
    })

    it('decode then encode returns original string', () => {
      const original = 'SGVsbG8sIFdvcmxkIQ'
      expect(encode(decode(original))).toBe(original)
    })

    it('roundtrip works with unicode', () => {
      const original = '你好世界 👋 שלום'
      expect(decode(encode(original))).toBe(original)
    })

    it('roundtrip works with special characters', () => {
      const original = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      expect(decode(encode(original))).toBe(original)
    })
  })
})