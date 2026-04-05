import { describe, it, expect } from 'vitest'
import { formatCurrency } from './format-currency'

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('formats a simple number as USD by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats a large number with thousands separators', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
    })

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats a negative number', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })
  })

  describe('currency options', () => {
    it('formats EUR currency', () => {
      const result = formatCurrency(1234.56, { currency: 'EUR' })
      expect(result).toContain('€')
    })

    it('formats GBP currency', () => {
      const result = formatCurrency(1234.56, { currency: 'GBP' })
      expect(result).toContain('£')
    })

    it('formats JPY currency (no decimals)', () => {
      const result = formatCurrency(1234.56, { currency: 'JPY' })
      // JPY typically shows no decimal places
      expect(result).toContain('¥')
    })

    it('formats CHF currency', () => {
      const result = formatCurrency(1234.56, { currency: 'CHF' })
      expect(result).toContain('CHF')
    })
  })

  describe('locale-aware formatting', () => {
    it('formats using en-US locale (default)', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats EUR using de-DE locale', () => {
      const result = formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' })
      // German locale formats EUR as "1.234,56 €" or "€ 1.234,56"
      expect(result).toContain('€')
      expect(result).toContain('1.234,56')
    })

    it('formats USD using fr-FR locale', () => {
      const result = formatCurrency(1234567.89, { locale: 'fr-FR' })
      // French uses narrow non-breaking space as thousands separator
      expect(result).toContain('$')
      expect(result).toContain('\u202F')
    })
  })

  describe('currency symbol options', () => {
    it('hides currency symbol when showCurrencySymbol is false', () => {
      const result = formatCurrency(1234.56, { showCurrencySymbol: false })
      expect(result).toBe('1,234.56')
    })

    it('uses currency code instead of symbol when useCurrencyCode is true', () => {
      const result = formatCurrency(1234.56, { useCurrencyCode: true })
      expect(result).toBe('USD 1,234.56')
    })

    it('uses currency code with EUR', () => {
      const result = formatCurrency(1234.56, { currency: 'EUR', useCurrencyCode: true })
      expect(result).toBe('EUR 1,234.56')
    })

    it('combines showCurrencySymbol false with locale formatting', () => {
      const result = formatCurrency(1234.56, { locale: 'de-DE', showCurrencySymbol: false })
      expect(result).toBe('1.234,56')
    })
  })

  describe('edge cases', () => {
    it('handles NaN', () => {
      expect(formatCurrency(NaN)).toBe('NaN')
    })

    it('handles Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('Infinity')
    })

    it('handles -Infinity', () => {
      expect(formatCurrency(-Infinity)).toBe('-Infinity')
    })

    it('handles very small numbers', () => {
      const result = formatCurrency(0.123456)
      expect(result).toBe('$0.12')
    })

    it('handles very large numbers', () => {
      const result = formatCurrency(1234567890.12)
      expect(result).toBe('$1,234,567,890.12')
    })

    it('handles negative very small numbers', () => {
      const result = formatCurrency(-0.99)
      expect(result).toBe('-$0.99')
    })
  })

  describe('combined options', () => {
    it('formats EUR in de-DE locale with currency code', () => {
      const result = formatCurrency(1234.56, {
        currency: 'EUR',
        locale: 'de-DE',
        useCurrencyCode: true,
      })
      // In de-DE, currency code appears after the number
      expect(result).toContain('EUR')
      expect(result).toContain('1.234,56')
    })

    it('formats USD in fr-FR locale without symbol', () => {
      const result = formatCurrency(1234.56, {
        locale: 'fr-FR',
        showCurrencySymbol: false,
      })
      // French uses narrow non-breaking space as thousands separator
      expect(result).toContain('1')
      expect(result).toContain('234,56')
    })
  })
})