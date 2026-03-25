import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not call the function immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()

    expect(fn).not.toHaveBeenCalled()
  })

  it('should call the function after the delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the function before the delay has elapsed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(299)

    expect(fn).not.toHaveBeenCalled()
  })

  it('should reset the timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)
    debounced()
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to the debounced function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('hello', 42)
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledWith('hello', 42)
  })

  it('should use the latest arguments when timer resets', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('first')
    vi.advanceTimersByTime(200)
    debounced('second')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })

  it('should allow multiple independent invocations after delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(300)

    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should handle zero delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 0)

    debounced()
    vi.advanceTimersByTime(0)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
