import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounceAdvanced, type DebouncedFunction } from './debounce-advanced'

describe('debounceAdvanced', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution until after delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounceAdvanced(fn, 100)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('only executes function once when called multiple times within delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounceAdvanced(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses the last arguments when executing', () => {
    const fn = vi.fn()
    const debouncedFn = debounceAdvanced(fn, 100)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('works with leading option', () => {
    const fn = vi.fn()
    const debouncedFn = debounceAdvanced(fn, 100, { leading: true })

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
    const debouncedFn = debounceAdvanced(fn, 100, { trailing: false })

    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('works with both leading and trailing options', () => {
    const fn = vi.fn()
    const debouncedFn = debounceAdvanced(fn, 100, { leading: true, trailing: true })

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
    const debouncedFn = debounceAdvanced(fn, 100)

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
      method: debounceAdvanced(fn, 100),
    }

    obj.method()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalled()
  })

  it('can be called with zero delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounceAdvanced(fn, 0)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  describe('cancel', () => {
    it('cancels pending debounced call', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100) as DebouncedFunction<typeof fn>

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      debouncedFn.cancel()

      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
    })

    it('can be called multiple times safely', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100) as DebouncedFunction<typeof fn>

      debouncedFn()
      debouncedFn.cancel()
      debouncedFn.cancel()
      debouncedFn.cancel()

      vi.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('flush', () => {
    it('executes pending call immediately', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100) as DebouncedFunction<typeof fn>

      debouncedFn('pending')
      expect(fn).not.toHaveBeenCalled()

      debouncedFn.flush()

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('pending')
    })

    it('does nothing if no call is pending', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100) as DebouncedFunction<typeof fn>

      debouncedFn.flush()
      expect(fn).not.toHaveBeenCalled()
    })

    it('clears timeout after flush', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100) as DebouncedFunction<typeof fn>

      debouncedFn('first')
      debouncedFn.flush()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('first')
    })
  })

  describe('maxWait', () => {
    it('executes after maxWait even if new calls keep coming', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100, { maxWait: 50 }) as DebouncedFunction<typeof fn>

      debouncedFn('first')
      vi.advanceTimersByTime(30)
      debouncedFn('second')

      // maxWait (50ms from first call) fires at t=50, before trailing (100ms)
      vi.advanceTimersByTime(20)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('second')

      // trailing is cancelled by maxWait, so no additional call
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('uses last arguments at maxWait', () => {
      const fn = vi.fn()
      const debouncedFn = debounceAdvanced(fn, 100, { maxWait: 50 }) as DebouncedFunction<typeof fn>

      debouncedFn('first')
      vi.advanceTimersByTime(30)
      debouncedFn('second')

      vi.advanceTimersByTime(20)
      expect(fn).toHaveBeenCalledWith('second')
    })
  })
})