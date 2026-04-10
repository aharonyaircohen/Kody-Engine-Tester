import { describe, it, expect } from 'vitest'
import { formatPhone } from './format-phone'

describe('formatPhone', () => {
  describe('US formatting (default)', () => {
    it('formats a 10-digit number as US style', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567')
    })

    it('formats a number with dashes', () => {
      expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    })

    it('formats a number with dots', () => {
      expect(formatPhone('555.123.4567')).toBe('(555) 123-4567')
    })

    it('formats a number with spaces', () => {
      expect(formatPhone('555 123 4567')).toBe('(555) 123-4567')
    })

    it('formats a number with parentheses', () => {
      expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567')
    })
  })

  describe('international formatting', () => {
    it('formats a 10-digit number as international style', () => {
      expect(formatPhone('5551234567', { style: 'international' })).toBe('555 123 4567')
    })

    it('formats an 11-digit US number with country code', () => {
      expect(formatPhone('15551234567', { style: 'international' })).toBe('+1 555 123 4567')
    })

    it('formats an 11-digit US number with country code as US style', () => {
      expect(formatPhone('15551234567', { style: 'us' })).toBe('+1 (555) 123-4567')
    })
  })

  describe('locale-aware formatting', () => {
    it('formats using en-US locale (default)', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567')
    })

    it('formats using de-DE locale with US style', () => {
      const result = formatPhone('5551234567', { locale: 'de-DE' })
      // Locale doesn't change the default style, still US format
      expect(result).toBe('(555) 123-4567')
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(formatPhone('')).toBe('')
    })

    it('handles string with no digits', () => {
      expect(formatPhone('abc-def-ghij')).toBe('abc-def-ghij')
    })

    it('handles fewer than 10 digits', () => {
      expect(formatPhone('12345')).toBe('12345')
    })

    it('handles more than 10 digits without country code', () => {
      // Returns digits only for unusual length
      expect(formatPhone('123456789012')).toBe('123456789012')
    })

    it('handles 11 digits starting with 1 as US number', () => {
      expect(formatPhone('15051234567')).toBe('+1 (505) 123-4567')
    })

    it('handles 11 digits not starting with 1', () => {
      // Shouldn't treat it as US number - returns digits only
      const result = formatPhone('44551234567')
      expect(result).toBe('44551234567')
    })
  })

  describe('combined options', () => {
    it('formats with US style and de-DE locale', () => {
      const result = formatPhone('5551234567', { style: 'us', locale: 'de-DE' })
      expect(result).toBe('(555) 123-4567')
    })

    it('formats with international style and de-DE locale', () => {
      const result = formatPhone('5551234567', { style: 'international', locale: 'de-DE' })
      expect(result).toBe('555 123 4567')
    })
  })
})
