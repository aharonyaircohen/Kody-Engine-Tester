import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './timing-helpers'

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

  it('handles object method context correctly', () => {
    const obj = {
      value: 0,
      increment: debounce(function (this: { value: number }, amount: number) {
        this.value += amount
      }, 100),
    }

    obj.increment(5)

    vi.advanceTimersByTime(100)
    expect(obj.value).toBe(5)
  })

  it('cancels previous timeout on rapid calls', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    vi.advanceTimersByTime(30)
    debouncedFn()
    vi.advanceTimersByTime(30)
    debouncedFn()
    vi.advanceTimersByTime(30)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
