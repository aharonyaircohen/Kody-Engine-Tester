import { describe, it, expect } from 'vitest'
import { formatBytes } from './format-bytes'

describe('formatBytes', () => {
  describe('basic formatting', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('formats 1024 bytes as 1 KB', () => {
      expect(formatBytes(1024)).toBe('1 KB')
    })

    it('formats 1048576 bytes as 1 MB', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
    })

    it('formats 1073741824 bytes as 1 GB', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
    })
  })

  describe('non-standard sizes', () => {
    it('formats bytes between B and KB', () => {
      expect(formatBytes(500)).toBe('500 B')
    })

    it('formats bytes between KB and MB', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('formats bytes between MB and GB', () => {
      expect(formatBytes(1572864)).toBe('1.5 MB')
    })

    it('formats bytes between GB and TB', () => {
      expect(formatBytes(1610612736)).toBe('1.5 GB')
    })

    it('formats large numbers correctly', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB')
    })
  })

  describe('custom decimal places', () => {
    it('formats with 0 decimal places', () => {
      expect(formatBytes(1536, { decimals: 0 })).toBe('2 KB')
    })

    it('formats with 1 decimal place', () => {
      expect(formatBytes(1536, { decimals: 1 })).toBe('1.5 KB')
    })

    it('formats with 3 decimal places', () => {
      // 1500000 bytes = 1.430511474609375 MB, should show up to 3 decimals
      const result = formatBytes(1500000, { decimals: 3 })
      expect(result).toMatch(/1\.43\d MB/)
    })
  })

  describe('locale-aware formatting', () => {
    it('formats using en-US locale (default)', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('formats using de-DE locale', () => {
      // German uses comma as decimal separator
      const result = formatBytes(1536, { locale: 'de-DE' })
      expect(result).toContain('KB')
      expect(result).toContain('1')
    })
  })

  describe('edge cases', () => {
    it('handles negative bytes', () => {
      expect(formatBytes(-1024)).toBe('-1 KB')
    })

    it('handles very large numbers', () => {
      expect(formatBytes(1125899906842624)).toBe('1 PB')
    })

    it('handles 1 byte', () => {
      expect(formatBytes(1)).toBe('1 B')
    })
  })
})
