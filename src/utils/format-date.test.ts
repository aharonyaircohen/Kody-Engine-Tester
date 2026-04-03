import { describe, it, expect } from 'vitest'
import { formatDate } from './format-date'

describe('formatDate', () => {
  describe('YYYY-MM-DD format', () => {
    it('formats a date in YYYY-MM-DD format', () => {
      const date = new Date(2026, 3, 3)
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-04-03')
    })

    it('pads single-digit month and day with zeros', () => {
      const date = new Date(2026, 0, 5)
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-05')
    })

    it('formats December correctly', () => {
      const date = new Date(2026, 11, 25)
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-12-25')
    })
  })

  describe('MM/DD/YYYY format', () => {
    it('formats a date in MM/DD/YYYY format', () => {
      const date = new Date(2026, 3, 3)
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('04/03/2026')
    })

    it('pads single-digit month and day with zeros', () => {
      const date = new Date(2026, 0, 5)
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/05/2026')
    })

    it('formats year correctly at century boundary', () => {
      const date = new Date(2000, 5, 15)
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('06/15/2000')
    })
  })

  describe('DD MMM YYYY format', () => {
    it('formats a date in DD MMM YYYY format', () => {
      const date = new Date(2026, 3, 3)
      expect(formatDate(date, 'DD MMM YYYY')).toBe('03 Apr 2026')
    })

    it('pads single-digit day with zeros', () => {
      const date = new Date(2026, 0, 5)
      expect(formatDate(date, 'DD MMM YYYY')).toBe('05 Jan 2026')
    })

    it('formats all months correctly', () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      months.forEach((abbrev, index) => {
        const date = new Date(2026, index, 15)
        expect(formatDate(date, 'DD MMM YYYY')).toBe(`15 ${abbrev} 2026`)
      })
    })
  })
})
