import { describe, it, expect } from 'vitest'
import { formatNumber } from './format-number'

describe('formatNumber', () => {
  describe('basic formatting', () => {
    it('formats a simple integer with default options', () => {
      expect(formatNumber(1234)).toBe('1,234.00')
    })

    it('formats a number with decimal places', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
    })

    it('formats a large number with thousands separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567.00')
    })

    it('formats a large number with decimals', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('formats zero correctly', () => {
      expect(formatNumber(0)).toBe('0.00')
    })
  })

  describe('custom decimal places', () => {
    it('formats with 0 decimal places', () => {
      expect(formatNumber(1234.56, { decimals: 0 })).toBe('1,235')
    })

    it('formats with 3 decimal places', () => {
      expect(formatNumber(1234.5678, { decimals: 3 })).toBe('1,234.568')
    })

    it('formats with 4 decimal places', () => {
      expect(formatNumber(1234.5, { decimals: 4 })).toBe('1,234.5000')
    })
  })

  describe('locale-aware formatting', () => {
    it('formats using en-US locale (default)', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('formats using de-DE locale', () => {
      expect(formatNumber(1234567.89, { locale: 'de-DE' })).toBe('1.234.567,89')
    })

    it('formats using fr-FR locale', () => {
      // French uses narrow non-breaking space (\u202F) as thousands separator
      const result = formatNumber(1234567.89, { locale: 'fr-FR' })
      expect(result).toContain(',')
      expect(result).toContain('89')
    })
  })

  describe('custom separators', () => {
    it('allows custom thousands separator', () => {
      expect(formatNumber(1234567.89, { thousandsSeparator: ' ' })).toBe('1 234 567.89')
    })

    it('allows custom decimal separator', () => {
      expect(formatNumber(1234567.89, { decimalSeparator: ',' })).toBe('1,234,567,89')
    })

    it('allows both custom separators', () => {
      expect(formatNumber(1234567.89, { thousandsSeparator: ' ', decimalSeparator: ',' })).toBe('1 234 567,89')
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers', () => {
      expect(formatNumber(-1234.56)).toBe('-1,234.56')
    })

    it('handles very small numbers', () => {
      expect(formatNumber(0.123456, { decimals: 4 })).toBe('0.1235')
    })

    it('handles NaN', () => {
      expect(formatNumber(NaN)).toBe('NaN')
    })

    it('handles Infinity', () => {
      expect(formatNumber(Infinity)).toBe('Infinity')
    })

    it('handles -Infinity', () => {
      expect(formatNumber(-Infinity)).toBe('-Infinity')
    })
  })
})
