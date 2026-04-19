import { describe, expect, it } from 'vitest'
import { formatDuration } from './format-duration'

describe('formatDuration', () => {
  describe('millisecond range (< 1000ms)', () => {
    it('returns ms for 0', () => {
      expect(formatDuration(0)).toBe('0ms')
    })

    it('returns ms for values below 1000', () => {
      expect(formatDuration(1)).toBe('1ms')
      expect(formatDuration(500)).toBe('500ms')
      expect(formatDuration(999)).toBe('999ms')
    })
  })

  describe('second range (>= 1000ms, < 60000ms)', () => {
    it('formats seconds with one decimal place', () => {
      expect(formatDuration(1000)).toBe('1.0s')
      expect(formatDuration(1500)).toBe('1.5s')
      expect(formatDuration(5000)).toBe('5.0s')
    })

    it('handles boundary values', () => {
      expect(formatDuration(999)).toBe('999ms')
      expect(formatDuration(1000)).toBe('1.0s')
      expect(formatDuration(59999)).toBe('60.0s')
    })
  })

  describe('minute range (>= 60000ms, < 3600000ms)', () => {
    it('formats minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m 0s')
      expect(formatDuration(65000)).toBe('1m 5s')
      expect(formatDuration(90000)).toBe('1m 30s')
    })

    it('handles multi-minute durations', () => {
      expect(formatDuration(120000)).toBe('2m 0s')
      expect(formatDuration(3600000)).toBe('1h 0m')
    })

    it('handles boundary values', () => {
      expect(formatDuration(59999)).toBe('60.0s')
      expect(formatDuration(60000)).toBe('1m 0s')
      expect(formatDuration(3599999)).toBe('59m 59s')
    })
  })

  describe('hour range (>= 3600000ms)', () => {
    it('formats hours and minutes', () => {
      expect(formatDuration(3600000)).toBe('1h 0m')
      expect(formatDuration(3661000)).toBe('1h 1m')
      expect(formatDuration(7200000)).toBe('2h 0m')
    })

    it('drops seconds when in hour range', () => {
      expect(formatDuration(3661000)).toBe('1h 1m')
      expect(formatDuration(9000000)).toBe('2h 30m')
    })

    it('handles boundary value', () => {
      expect(formatDuration(3599999)).toBe('59m 59s')
      expect(formatDuration(3600000)).toBe('1h 0m')
    })
  })

  describe('day range (>= 86400000ms)', () => {
    it('formats days and hours', () => {
      expect(formatDuration(86400000)).toBe('1d 0h')
      expect(formatDuration(90000000)).toBe('1d 1h')
      expect(formatDuration(172800000)).toBe('2d 0h')
      expect(formatDuration(176400000)).toBe('2d 1h')
    })

    it('drops minutes and seconds in day range', () => {
      expect(formatDuration(90060000)).toBe('1d 1h')
      expect(formatDuration(90396000)).toBe('1d 1h')
    })

    it('handles boundary value', () => {
      expect(formatDuration(86399999)).toBe('23h 59m')
      expect(formatDuration(86400000)).toBe('1d 0h')
    })

    it('handles multi-day durations', () => {
      expect(formatDuration(259200000)).toBe('3d 0h')
      expect(formatDuration(266400000)).toBe('3d 2h')
    })
  })

  describe('edge cases', () => {
    it('handles exactly 0', () => {
      expect(formatDuration(0)).toBe('0ms')
    })

    it('handles exact second boundaries', () => {
      expect(formatDuration(1000)).toBe('1.0s')
    })

    it('handles exact minute boundaries', () => {
      expect(formatDuration(60000)).toBe('1m 0s')
    })

    it('handles exact hour boundaries', () => {
      expect(formatDuration(3600000)).toBe('1h 0m')
    })

    it('handles exact day boundary', () => {
      expect(formatDuration(86400000)).toBe('1d 0h')
    })
  })
})
