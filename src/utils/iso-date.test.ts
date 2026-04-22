import { describe, expect, it } from 'vitest'

import { isValidIsoDate } from './iso-date'

describe('isValidIsoDate', () => {
  it('returns true for valid UTC ISO datetime strings', () => {
    expect(isValidIsoDate('2025-04-22T10:15:30.000Z')).toBe(true)
    expect(isValidIsoDate('2025-04-22T10:15:30Z')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isValidIsoDate('')).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidIsoDate(null as unknown as string)).toBe(false)
    expect(isValidIsoDate(undefined as unknown as string)).toBe(false)
    expect(isValidIsoDate(123 as unknown as string)).toBe(false)
    expect(isValidIsoDate({} as unknown as string)).toBe(false)
  })

  it('returns false for obviously invalid strings', () => {
    expect(isValidIsoDate('not-a-date')).toBe(false)
    expect(isValidIsoDate('hello world')).toBe(false)
    expect(isValidIsoDate('2025-13-45')).toBe(false)
  })

  it('returns false for date-only strings (no time component)', () => {
    expect(isValidIsoDate('2025-04-22')).toBe(false)
  })

  it('returns false for local-time strings (no Z suffix)', () => {
    expect(isValidIsoDate('2025-04-22T10:15:30')).toBe(false)
  })

  it('returns false for fractional seconds variations that do not match', () => {
    // Milliseconds shorter than 3 digits
    expect(isValidIsoDate('2025-04-22T10:15:30.5Z')).toBe(false)
    expect(isValidIsoDate('2025-04-22T10:15:30.55Z')).toBe(false)
  })
})
