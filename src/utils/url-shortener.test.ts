import { describe, it, expect } from 'vitest'
import {
  generateShortCode,
  generateShortCodeSync,
  isValidShortCode,
  encodeUrl,
  decodeUrl,
} from './url-shortener'

describe('url-shortener', () => {
  describe('generateShortCode', () => {
    it('generates a short code for a valid URL', async () => {
      const result = await generateShortCode('https://example.com/very/long/path')

      expect(result.shortCode).toBeDefined()
      expect(result.shortCode.length).toBe(7) // default length
      expect(result.originalUrl).toBe('https://example.com/very/long/path')
    })

    it('generates deterministic short codes for the same URL', async () => {
      const url = 'https://example.com/test'

      const result1 = await generateShortCode(url)
      const result2 = await generateShortCode(url)

      expect(result1.shortCode).toBe(result2.shortCode)
    })

    it('generates different short codes for different URLs', async () => {
      const result1 = await generateShortCode('https://example.com/page1')
      const result2 = await generateShortCode('https://example.com/page2')

      expect(result1.shortCode).not.toBe(result2.shortCode)
    })

    it('respects custom length option', async () => {
      const result5 = await generateShortCode('https://example.com', { length: 5 })
      const result10 = await generateShortCode('https://example.com', { length: 10 })
      const result20 = await generateShortCode('https://example.com', { length: 20 })

      expect(result5.shortCode.length).toBe(5)
      expect(result10.shortCode.length).toBe(10)
      expect(result20.shortCode.length).toBe(20)
    })

    it('clamps length to valid range (1-32)', async () => {
      const result0 = await generateShortCode('https://example.com', { length: 0 })
      const resultNeg = await generateShortCode('https://example.com', { length: -5 })
      const resultBig = await generateShortCode('https://example.com', { length: 100 })

      expect(result0.shortCode.length).toBe(1)  // min is 1
      expect(resultNeg.shortCode.length).toBe(1) // min is 1
      expect(resultBig.shortCode.length).toBe(32) // max is 32
    })

    it('generates different codes with different salts', async () => {
      const url = 'https://example.com/page'

      const result1 = await generateShortCode(url, { salt: 'salt1' })
      const result2 = await generateShortCode(url, { salt: 'salt2' })

      expect(result1.shortCode).not.toBe(result2.shortCode)
    })

    it('throws error for empty URL', async () => {
      await expect(generateShortCode('')).rejects.toThrow('URL is required')
    })

    it('uses only base62 characters (a-z, A-Z, 0-9)', async () => {
      const result = await generateShortCode('https://example.com/test/path?query=1&other=2')

      expect(result.shortCode).toMatch(/^[a-zA-Z0-9]+$/)
    })

    it('handles URLs with special characters', async () => {
      const result = await generateShortCode('https://example.com/page?q=hello world&foo=bar#section')

      expect(result.shortCode.length).toBe(7)
      expect(result.shortCode).toMatch(/^[a-zA-Z0-9]+$/)
    })

    it('handles very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000)

      const result = await generateShortCode(longUrl)

      expect(result.shortCode.length).toBe(7)
      expect(result.shortCode).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })

  describe('generateShortCodeSync', () => {
    it('generates a short code synchronously', () => {
      const result = generateShortCodeSync('https://example.com/very/long/path')

      expect(result.shortCode).toBeDefined()
      expect(result.shortCode.length).toBe(7)
      expect(result.originalUrl).toBe('https://example.com/very/long/path')
    })

    it('generates deterministic short codes', () => {
      const url = 'https://example.com/test'

      const result1 = generateShortCodeSync(url)
      const result2 = generateShortCodeSync(url)

      expect(result1.shortCode).toBe(result2.shortCode)
    })

    it('generates different codes with different salts', () => {
      const url = 'https://example.com/page'

      const result1 = generateShortCodeSync(url, { salt: 'salt1' })
      const result2 = generateShortCodeSync(url, { salt: 'salt2' })

      expect(result1.shortCode).not.toBe(result2.shortCode)
    })

    it('throws error for empty URL', () => {
      expect(() => generateShortCodeSync('')).toThrow('URL is required')
    })

    it('respects custom length option', () => {
      const result5 = generateShortCodeSync('https://example.com', { length: 5 })
      const result10 = generateShortCodeSync('https://example.com', { length: 10 })

      expect(result5.shortCode.length).toBe(5)
      expect(result10.shortCode.length).toBe(10)
    })
  })

  describe('isValidShortCode', () => {
    it('returns true for valid short codes', () => {
      expect(isValidShortCode('abc123')).toBe(true)
      expect(isValidShortCode('ABCDEF')).toBe(true)
      expect(isValidShortCode('aBcDeF123456')).toBe(true)
    })

    it('returns false for codes with invalid characters', () => {
      expect(isValidShortCode('abc-123')).toBe(false)
      expect(isValidShortCode('abc_123')).toBe(false)
      expect(isValidShortCode('abc 123')).toBe(false)
      expect(isValidShortCode('abc@123')).toBe(false)
    })

    it('returns false for codes that are too long', () => {
      expect(isValidShortCode('a'.repeat(33))).toBe(false)
    })

    it('returns false for empty or null inputs', () => {
      expect(isValidShortCode('')).toBe(false)
      expect(isValidShortCode(null as unknown as string)).toBe(false)
      expect(isValidShortCode(undefined as unknown as string)).toBe(false)
    })

    it('returns false for non-string inputs', () => {
      expect(isValidShortCode(123 as unknown as string)).toBe(false)
      expect(isValidShortCode({} as unknown as string)).toBe(false)
    })
  })

  describe('encodeUrl', () => {
    it('is an alias for generateShortCode', async () => {
      const url = 'https://example.com/page'

      const result1 = await encodeUrl(url)
      const result2 = await generateShortCode(url)

      expect(result1.shortCode).toBe(result2.shortCode)
    })
  })

  describe('decodeUrl', () => {
    it('throws error indicating one-way hash', () => {
      expect(() => decodeUrl('abc123')).toThrow(/one-way hash/)
      expect(() => decodeUrl('abc123')).toThrow(/cannot be recovered/)
    })
  })
})