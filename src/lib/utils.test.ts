import { describe, it, expect } from 'vitest'
import { formatDate } from './utils'

describe('formatDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const date = new Date('2024-03-15T10:30:00Z')
    expect(formatDate(date)).toBe('2024-03-15')
  })

  it('pads single-digit month with leading zero', () => {
    const date = new Date('2024-01-05T00:00:00Z')
    expect(formatDate(date)).toBe('2024-01-05')
  })

  it('pads single-digit day with leading zero', () => {
    const date = new Date('2024-06-09T00:00:00Z')
    expect(formatDate(date)).toBe('2024-06-09')
  })

  it('handles year boundary correctly', () => {
    const date = new Date('2025-12-31T23:59:59Z')
    expect(formatDate(date)).toBe('2025-12-31')
  })

  it('handles beginning of year correctly', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    expect(formatDate(date)).toBe('2026-01-01')
  })
})