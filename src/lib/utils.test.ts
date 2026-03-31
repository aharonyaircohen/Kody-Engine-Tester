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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './utils'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution until after delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('only executes function once when called multiple times within delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses the last arguments when executing', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('handles multiple arguments correctly', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 2, true)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('arg1', 2, true)
  })

  it('works with leading option', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100, { leading: true })

    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    debouncedFn()
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('works with trailing option set to false', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100, { trailing: false })

    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('works with both leading and trailing options', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100, { leading: true, trailing: true })

    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    debouncedFn()
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('re-executes after delay if called again', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('preserves this context', () => {
    const fn = vi.fn()
    const obj = {
      value: 42,
      method: debounce(fn, 100),
    }

    obj.method()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalled()
  })

  it('can be called with zero delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 0)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('debounced function can be called multiple times after delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 50)

    debouncedFn(1)
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    debouncedFn(2)
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(2)
  })
})
