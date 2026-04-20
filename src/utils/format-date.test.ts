import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate } from './format-date'

describe('formatDate', () => {
  // Freeze time for consistent relative date tests
  const frozenNow = new Date('2024-06-15T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(frozenNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('ISO format', () => {
    it('formats a date using toISOString()', () => {
      const date = new Date('2024-01-15T10:30:00.000Z')
      expect(formatDate(date, { format: 'iso' })).toBe('2024-01-15T10:30:00.000Z')
    })

    it('formats a date with different time components', () => {
      const date = new Date('2024-12-31T23:59:59.999Z')
      expect(formatDate(date, { format: 'iso' })).toBe('2024-12-31T23:59:59.999Z')
    })

    it('returns invalid date string as-is', () => {
      const invalidDate = new Date('invalid')
      expect(formatDate(invalidDate, { format: 'iso' })).toBe('Invalid Date')
    })
  })

  describe('relative format', () => {
    it('formats a date in the past as "X ago"', () => {
      // 2 hours ago
      const date = new Date('2024-06-15T10:00:00Z')
      const result = formatDate(date, { format: 'relative' })
      expect(result).toMatch(/2.*hour.*ago/)
    })

    it('formats a date far in the past', () => {
      // 3 months ago
      const date = new Date('2024-03-15T12:00:00Z')
      const result = formatDate(date, { format: 'relative' })
      expect(result).toMatch(/3.*month.*ago/)
    })

    it('formats a date far in the future', () => {
      // 1 year from now
      const date = new Date('2025-06-15T12:00:00Z')
      const result = formatDate(date, { format: 'relative' })
      expect(result).toMatch(/in.*1.*year/)
    })

    it('formats a recent date in minutes', () => {
      // 30 minutes ago
      const date = new Date('2024-06-15T11:30:00Z')
      const result = formatDate(date, { format: 'relative' })
      expect(result).toMatch(/30.*minute.*ago/)
    })

    it('formats with short style', () => {
      const date = new Date('2024-06-15T10:00:00Z')
      const result = formatDate(date, { format: 'relative', relativeStyle: 'short' })
      expect(result).toContain('h')
    })

    it('formats with narrow style', () => {
      const date = new Date('2024-06-15T10:00:00Z')
      const result = formatDate(date, { format: 'relative', relativeStyle: 'narrow' })
      expect(result).toContain('h')
    })

    it('uses custom reference date', () => {
      const referenceDate = new Date('2024-06-16T12:00:00Z')
      const date = new Date('2024-06-15T12:00:00Z')
      const result = formatDate(date, { format: 'relative', referenceDate })
      expect(result).toMatch(/1.*day.*ago/)
    })
  })

  describe('locale format', () => {
    it('formats a date with default locale (en-US)', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('1/15/2024')
    })

    it('formats a date with de-DE locale', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date, { locale: 'de-DE' })).toBe('15.1.2024')
    })

    it('formats a date with custom locale options', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date, {
        locale: 'en-US',
        localeOptions: { year: 'numeric', month: 'long', day: 'numeric' },
      })
      expect(result).toBe('January 15, 2024')
    })

    it('formats with time components', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date, {
        localeOptions: {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'UTC',
        },
      })
      expect(result).toContain('2024')
      expect(result).toContain('10')
    })
  })

  describe('edge cases', () => {
    it('handles invalid Date object', () => {
      const invalidDate = new Date('invalid')
      expect(formatDate(invalidDate)).toBe('Invalid Date')
    })

    it('handles epoch date', () => {
      const epoch = new Date(0)
      const result = formatDate(epoch)
      // Should not throw, formatted according to locale
      expect(result).toBeTruthy()
    })

    it('handles far future date', () => {
      const farFuture = new Date('2099-06-15T12:00:00Z')
      const result = formatDate(farFuture, { format: 'locale' })
      expect(result).toContain('2099')
    })
  })
})