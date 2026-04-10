import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { retry } from './async-helpers'

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('succeeds on first attempt when function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const resultPromise = retry(fn, 3, 1000)
    await vi.advanceTimersByTimeAsync(0)
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries failed function and succeeds on second attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const resultPromise = retry(fn, 3, 1000)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // first retry delay (1000 * 2^0)
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries maxAttempts times before throwing', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    const resultPromise = retry(fn, 3, 1000)
    resultPromise.catch(() => {}) // suppress unhandled rejection

    // First attempt
    await vi.advanceTimersByTimeAsync(0)
    // Retry 1: delay = 1000 * 2^0 = 1000
    await vi.advanceTimersByTimeAsync(1000)
    // Retry 2: delay = 1000 * 2^1 = 2000
    await vi.advanceTimersByTimeAsync(2000)
    // Retry 3: delay = 1000 * 2^2 = 4000

    await expect(resultPromise).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('uses exponential backoff for delays', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 4, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    // Attempt 1 fails, delay = 1000 * 2^0 = 1000
    await vi.advanceTimersByTimeAsync(1000)
    // Attempt 2 fails, delay = 1000 * 2^1 = 2000
    await vi.advanceTimersByTimeAsync(2000)
    // Attempt 3 fails, delay = 1000 * 2^2 = 4000
    await vi.advanceTimersByTimeAsync(4000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('throws the last error if all retries fail', async () => {
    const errors = [new Error('error 1'), new Error('error 2'), new Error('final error')]
    let callCount = 0

    const fn = vi.fn().mockImplementation(() => {
      return Promise.reject(errors[callCount++])
    })

    const resultPromise = retry(fn, 3, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(resultPromise).rejects.toThrow('final error')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('succeeds on last attempt with custom delay', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const resultPromise = retry(fn, 3, 500)
    await vi.advanceTimersByTimeAsync(0)
    // Attempt 1 fails, delay = 500 * 2^0 = 500
    await vi.advanceTimersByTimeAsync(500)
    // Attempt 2 fails, delay = 500 * 2^1 = 1000
    await vi.advanceTimersByTimeAsync(1000)
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})