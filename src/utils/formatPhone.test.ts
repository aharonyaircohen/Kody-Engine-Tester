import { describe, it, expect } from 'vitest'
import { formatPhone } from './formatPhone'

describe('formatPhone', () => {
  describe('US format (default)', () => {
    it('formats a 10-digit US number', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567')
    })

    it('formats a 10-digit US number with dots as separator', () => {
      expect(formatPhone('5551234567', { separator: '.' })).toBe('(555) 123.4567')
    })

    it('handles phone number with existing formatting', () => {
      expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567')
    })

    it('handles phone number with dashes', () => {
      expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    })

    it('handles phone number with spaces', () => {
      expect(formatPhone('555 123 4567')).toBe('(555) 123-4567')
    })

    it('handles phone number with dots', () => {
      expect(formatPhone('555.123.4567')).toBe('(555) 123-4567')
    })
  })

  describe('International format', () => {
    it('formats a 10-digit US number in international style', () => {
      expect(formatPhone('5551234567', { style: 'intl' })).toBe('+1 (555) 123-4567')
    })

    it('formats an 11-digit US number with country code', () => {
      expect(formatPhone('15551234567')).toBe('+1 (555) 123-4567')
    })

    it('formats a 10-digit US number with includeCountryCode', () => {
      expect(formatPhone('5551234567', { includeCountryCode: true })).toBe('+1 (555) 123-4567')
    })

    it('formats a 10-digit US number in intl style with custom separator', () => {
      expect(formatPhone('5551234567', { style: 'intl', separator: '.' })).toBe('+1 (555) 123.4567')
    })
  })

  describe('international numbers', () => {
    it('formats a UK number (44 country code)', () => {
      expect(formatPhone('442071234567')).toBe('+44 (207) 123-4567')
    })

    it('formats a number with 3-digit country code', () => {
      // Example: 1-234-567-8901 format for some countries
      expect(formatPhone('12345678901')).toBe('+1 (234) 567-8901')
    })
  })

  describe('edge cases', () => {
    it('returns input for empty string', () => {
      expect(formatPhone('')).toBe('')
    })

    it('returns input for non-numeric characters only', () => {
      expect(formatPhone('abc-def-ghij')).toBe('abc-def-ghij')
    })

    it('handles phone number with extension', () => {
      // Extension is stripped since it becomes part of the digit string
      // '5551234567 ext 123' -> 13 digits, treated as international
      const result = formatPhone('5551234567 ext 123')
      expect(result).toMatch(/^\+\d+/)
    })

    it('handles short numbers', () => {
      // Short numbers are treated as country code + remaining digits
      expect(formatPhone('12345')).toBe('+1 2345')
    })

    it('handles very long numbers', () => {
      // 14 digits: country code 123, remaining 45678901234
      expect(formatPhone('12345678901234')).toBe('+123 4567-8901-234')
    })
  })

  describe('options combinations', () => {
    it('uses custom separator in US format', () => {
      expect(formatPhone('5551234567', { separator: '.' })).toBe('(555) 123.4567')
    })

    it('uses custom separator in international format', () => {
      expect(formatPhone('15551234567', { separator: '.' })).toBe('+1 (555) 123.4567')
    })

    it('combines style and separator options', () => {
      expect(formatPhone('5551234567', { style: 'intl', separator: ' ' })).toBe('+1 (555) 123 4567')
    })
  })
})