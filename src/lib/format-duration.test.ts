import { describe, it, expect } from 'vitest'
import { formatDuration } from './format-duration'

describe('formatDuration', () => {
  describe('basic formatting', () => {
    it('formats zero as 0ms', () => {
      expect(formatDuration(0)).toBe('0ms')
    })

    it('formats sub-second durations as Nms', () => {
      expect(formatDuration(500)).toBe('500ms')
    })

    it('formats 1 second as 1s', () => {
      expect(formatDuration(1000)).toBe('1s')
    })

    it('formats 1.5 seconds as 1.5s', () => {
      expect(formatDuration(1500)).toBe('1.5s')
    })

    it('formats 59.9 seconds', () => {
      expect(formatDuration(59900)).toBe('59.9s')
    })
  })

  describe('minutes and seconds', () => {
    it('formats exactly 1 minute as 1m 0s', () => {
      expect(formatDuration(60000)).toBe('1m 0s')
    })

    it('formats 1m 5.5s', () => {
      expect(formatDuration(65500)).toBe('1m 5.5s')
    })

    it('formats 2m 5.5s (issue example: 125500ms)', () => {
      expect(formatDuration(125500)).toBe('2m 5.5s')
    })

    it('formats 10m 30s', () => {
      expect(formatDuration(630000)).toBe('10m 30s')
    })
  })

  describe('edge cases', () => {
    it('formats 999ms as 999ms', () => {
      expect(formatDuration(999)).toBe('999ms')
    })

    it('formats 59999ms as 1m 0s (59.999s rounds to 60s)', () => {
      expect(formatDuration(59999)).toBe('1m 0s')
    })

    it('formats 60050ms as 1m 0.1s (60.05s rounds to 60.1s → rollover)', () => {
      expect(formatDuration(60100)).toBe('1m 0.1s')
    })
  })

  describe('invalid inputs', () => {
    it('throws for negative input', () => {
      expect(() => formatDuration(-1)).toThrow()
    })

    it('throws for NaN', () => {
      expect(() => formatDuration(NaN)).toThrow()
    })

    it('throws for Infinity', () => {
      expect(() => formatDuration(Infinity)).toThrow()
    })
  })
})
