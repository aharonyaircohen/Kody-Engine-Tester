import { describe, it, expect } from 'vitest'
import { generateShortCode, generateShortCodeSync } from './url-shortener'

describe('url-shortener whitespace bug repro (#3702)', () => {
  describe('generateShortCode', () => {
    it('throws URL is required for whitespace-only URL', async () => {
      await expect(generateShortCode('   ')).rejects.toThrow('URL is required')
    })

    it('throws URL is required for tab-only URL', async () => {
      await expect(generateShortCode('\t\t')).rejects.toThrow('URL is required')
    })

    it('throws URL is required for newline-only URL', async () => {
      await expect(generateShortCode('\n\n')).rejects.toThrow('URL is required')
    })
  })

  describe('generateShortCodeSync', () => {
    it('throws URL is required for whitespace-only URL', () => {
      expect(() => generateShortCodeSync('   ')).toThrow('URL is required')
    })

    it('throws URL is required for tab-only URL', () => {
      expect(() => generateShortCodeSync('\t\t')).toThrow('URL is required')
    })

    it('throws URL is required for newline-only URL', () => {
      expect(() => generateShortCodeSync('\n\n')).toThrow('URL is required')
    })
  })
})
