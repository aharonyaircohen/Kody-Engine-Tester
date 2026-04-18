import { describe, it, expect } from 'vitest'
import { formatBytes } from './format-bytes'

describe('formatBytes', () => {
  describe('bytes (B) — less than 1024', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0B')
    })

    it('formats 1 byte', () => {
      expect(formatBytes(1)).toBe('1B')
    })

    it('formats a mid-range byte value', () => {
      expect(formatBytes(512)).toBe('512B')
    })

    it('formats 1023 bytes', () => {
      expect(formatBytes(1023)).toBe('1023B')
    })
  })

  describe('kilobytes (KB) — 1024 to 1024*1024-1', () => {
    it('formats exactly 1 KB', () => {
      expect(formatBytes(1024)).toBe('1.0KB')
    })

    it('formats a fractional KB', () => {
      expect(formatBytes(1536)).toBe('1.5KB')
    })

    it('formats a large KB value', () => {
      expect(formatBytes(1024 * 1024 - 1)).toBe('1024.0KB')
    })
  })

  describe('megabytes (MB) — 1024*1024 to 1024*1024*1024-1', () => {
    it('formats exactly 1 MB', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.0MB')
    })

    it('formats a fractional MB', () => {
      expect(formatBytes(Math.round(1.5 * 1024 * 1024))).toBe('1.5MB')
    })

    it('formats a large MB value', () => {
      expect(formatBytes(1024 * 1024 * 1024 - 1)).toBe('1024.0MB')
    })
  })

  describe('gigabytes (GB) — 1024*1024*1024 and above', () => {
    it('formats exactly 1 GB', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0GB')
    })

    it('formats a fractional GB', () => {
      expect(formatBytes(Math.round(2.5 * 1024 * 1024 * 1024))).toBe('2.5GB')
    })

    it('formats a very large GB value', () => {
      expect(formatBytes(10 * 1024 * 1024 * 1024)).toBe('10.0GB')
    })
  })
})
