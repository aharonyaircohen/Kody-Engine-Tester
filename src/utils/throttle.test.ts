import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('executes the function immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does not execute again within the delay period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(50)
    throttled()
    vi.advanceTimersByTime(30)
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('executes again after the delay period has passed', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('executes multiple times with correct timing', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    vi.advanceTimersByTime(200)
    throttled()
    vi.advanceTimersByTime(200)
    throttled()

    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('passes arguments to the underlying function', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('a', 1, true)

    expect(fn).toHaveBeenCalledWith('a', 1, true)
  })

  it('passes the most recent valid call arguments', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled('first')
    vi.advanceTimersByTime(100)
    throttled('second')

    expect(fn).toHaveBeenNthCalledWith(1, 'first')
    expect(fn).toHaveBeenNthCalledWith(2, 'second')
  })

  it('returns the return value of the function', () => {
    const fn = vi.fn().mockReturnValue(42)
    const throttled = throttle(fn, 100)

    const result = throttled()

    expect(result).toBe(42)
  })

  it('returns undefined when called within delay period', () => {
    const fn = vi.fn().mockReturnValue(42)
    const throttled = throttle(fn, 100)

    throttled()
    const result = throttled()

    expect(result).toBeUndefined()
  })

  it('resets properly and allows execution after delay', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 500)

    throttled()
    vi.advanceTimersByTime(300)
    throttled() // blocked
    vi.advanceTimersByTime(200) // total 500ms from first call
    throttled() // allowed

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('works with a delay of 0', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 0)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(3)
  })
})
