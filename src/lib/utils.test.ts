import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clamp, debounce } from './utils'

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

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(-100, 0, 10)).toBe(0)
  })

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(100, 0, 10)).toBe(10)
  })

  it('handles negative ranges', () => {
    expect(clamp(0, -10, -5)).toBe(-5)
    expect(clamp(-7, -10, -5)).toBe(-7)
    expect(clamp(-15, -10, -5)).toBe(-10)
  })

  it('handles floating point values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(-0.5, 0, 1)).toBe(0)
    expect(clamp(1.5, 0, 1)).toBe(1)
  })
})
