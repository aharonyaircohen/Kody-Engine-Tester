import { describe, it, expect } from 'vitest'
import { formatDate } from './dateUtils'

describe('formatDate', () => {
  it('formats a date with en-US locale', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    expect(formatDate(date, 'en-US')).toBe('1/15/2024')
  })

  it('formats a date with de-DE locale', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    expect(formatDate(date, 'de-DE')).toBe('15.1.2024')
  })

  it('formats a date with fr-FR locale', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    expect(formatDate(date, 'fr-FR')).toBe('15/01/2024')
  })

  it('formats a date with ja-JP locale', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    // ja-JP omits leading zeros on month/day via Intl.DateTimeFormat defaults
    expect(formatDate(date, 'ja-JP')).toBe('2024/1/15')
  })

  it('formats a date far in the future', () => {
    const date = new Date('2099-12-31T23:59:59Z')
    // Verify year is present — exact output varies by host timezone offset
    const result = formatDate(date, 'en-US')
    expect(result).toMatch(/2099|2100/)
  })

  it('formats a date at epoch', () => {
    const epoch = new Date(0)
    expect(formatDate(epoch, 'en-US')).toBe('1/1/1970')
  })

  it('returns Invalid Date string for an invalid Date object', () => {
    const invalidDate = new Date('not-a-date')
    expect(formatDate(invalidDate, 'en-US')).toBe('Invalid Date')
  })
})
