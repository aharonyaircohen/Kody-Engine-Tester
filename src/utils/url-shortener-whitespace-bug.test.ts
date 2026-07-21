import { describe, it, expect } from 'vitest'
import { generateShortCode, generateShortCodeSync } from './url-shortener'

/**
 * Bug #3703: URL shortener accepts whitespace-only URLs
 *
 * The shortener throws "URL is required" for empty string "",
 * but accepts whitespace-only strings like "   " and generates
 * a short code for invalid input instead of failing validation.
 */
describe('url-shortener whitespace bug (#3703)', () => {
  describe('generateShortCode', () => {
    it('throws error for whitespace-only URL', async () => {
      await expect(generateShortCode('   ')).rejects.toThrow('URL is required')
    })

    it('throws error for tab-only URL', async () => {
      await expect(generateShortCode('\t\t')).rejects.toThrow('URL is required')
    })

    it('throws error for newline-only URL', async () => {
      await expect(generateShortCode('\n\n')).rejects.toThrow('URL is required')
    })
  })

  describe('generateShortCodeSync', () => {
    it('throws error for whitespace-only URL', () => {
      expect(() => generateShortCodeSync('   ')).toThrow('URL is required')
    })

    it('throws error for tab-only URL', () => {
      expect(() => generateShortCodeSync('\t\t')).toThrow('URL is required')
    })

    it('throws error for newline-only URL', () => {
      expect(() => generateShortCodeSync('\n\n')).toThrow('URL is required')
    })
  })
})