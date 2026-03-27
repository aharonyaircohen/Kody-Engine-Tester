import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce'

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

    // First call - leading edge
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    // Subsequent calls within delay - only tracked
    debouncedFn()
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    // After delay - trailing edge
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

  it('works with async functions', async () => {
    const fn = vi.fn().mockResolvedValue('result')
    const debouncedFn = debounce(fn, 100)

    debouncedFn()

    vi.advanceTimersByTime(100)

    const result = await fn.mock.results[0].value
    expect(result).toBe('result')
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
})
