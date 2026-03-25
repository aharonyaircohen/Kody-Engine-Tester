import { describe, it, expect } from 'vitest'
import { formatDate } from './format-date'

describe('formatDate', () => {
  it('should format a date in YYYY-MM-DD format', () => {
    expect(formatDate(new Date('2025-03-25'))).toBe('2025-03-25')
  })

  it('should zero-pad single-digit months', () => {
    expect(formatDate(new Date('2025-01-05'))).toBe('2025-01-05')
  })

  it('should zero-pad single-digit days', () => {
    expect(formatDate(new Date('2025-12-01'))).toBe('2025-12-01')
  })

  it('should handle year 2000', () => {
    expect(formatDate(new Date('2000-02-29'))).toBe('2000-02-29')
  })

  it('should handle end of year', () => {
    expect(formatDate(new Date('2024-12-31'))).toBe('2024-12-31')
  })
})
