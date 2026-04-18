import { describe, it, expect } from 'vitest'
import { formatDate } from './dateUtils'

describe('formatDate', () => {
  it('formats a date in en-US locale', () => {
    const date = new Date(2024, 0, 15) // January 15, 2024
    expect(formatDate(date, 'en-US')).toBe('January 15, 2024')
  })

  it('formats a date in de-DE locale', () => {
    const date = new Date(2024, 3, 5) // April 5, 2024
    expect(formatDate(date, 'de-DE')).toBe('5. April 2024')
  })

  it('formats a date in he-IL locale (RTL)', () => {
    const date = new Date(2024, 5, 20) // June 20, 2024
    expect(formatDate(date, 'he-IL')).toBe('20 ביוני 2024')
  })

  it('formats a date in fr-FR locale', () => {
    const date = new Date(2024, 6, 1) // July 1, 2024
    expect(formatDate(date, 'fr-FR')).toBe('1 juillet 2024')
  })

  it('formats a date in ja-JP locale', () => {
    const date = new Date(2024, 11, 31) // December 31, 2024
    expect(formatDate(date, 'ja-JP')).toBe('2024年12月31日')
  })

  it('formats a date on the first day of the year', () => {
    const date = new Date(2024, 0, 1) // January 1, 2024
    expect(formatDate(date, 'en-US')).toBe('January 1, 2024')
  })

  it('formats a date on the last day of the year', () => {
    const date = new Date(2024, 11, 31) // December 31, 2024
    expect(formatDate(date, 'en-GB')).toBe('31 December 2024')
  })

  it('returns a non-empty string for any valid date', () => {
    const date = new Date()
    const result = formatDate(date, 'en-US')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats epoch date correctly', () => {
    const date = new Date(0) // January 1, 1970 (UTC)
    const result = formatDate(date, 'en-US')
    expect(result).toContain('1970')
  })

  it('formats a date far in the future', () => {
    const date = new Date(2099, 8, 15) // September 15, 2099
    expect(formatDate(date, 'en-US')).toBe('September 15, 2099')
  })

  it('formats a date far in the past', () => {
    const date = new Date(1900, 0, 1) // January 1, 1900
    expect(formatDate(date, 'en-US')).toBe('January 1, 1900')
  })

  it('uses the last argument as locale string', () => {
    const date = new Date(2024, 6, 4) // July 4, 2024
    expect(formatDate(date, 'es-ES')).toBe('4 de julio de 2024')
    expect(formatDate(date, 'en-GB')).toBe('4 July 2024')
  })
})
