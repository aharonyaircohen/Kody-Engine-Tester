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

    const resultPromise = retry(fn, 3, 100)
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

    const resultPromise = retry(fn, 3, 100)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100) // first retry delay
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries maxAttempts times before throwing', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    const resultPromise = retry(fn, 3, 100)
    resultPromise.catch(() => {}) // suppress unhandled rejection

    // First attempt
    await vi.advanceTimersByTimeAsync(0)
    // Retry 1 delay: 100 * 2^0 = 100
    await vi.advanceTimersByTimeAsync(100)
    // Retry 2 delay: 100 * 2^1 = 200
    await vi.advanceTimersByTimeAsync(200)
    // Retry 3 delay: 100 * 2^2 = 400 (but this is the last attempt, so no delay after)

    await expect(resultPromise).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(3) // 3 total attempts (maxAttempts=3)
  })

  it('uses exponential backoff for delays', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 4, 100)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    // Delay after attempt 0: 100 * 2^0 = 100
    await vi.advanceTimersByTimeAsync(100)
    // Delay after attempt 1: 100 * 2^1 = 200
    await vi.advanceTimersByTimeAsync(200)
    // Delay after attempt 2: 100 * 2^2 = 400
    await vi.advanceTimersByTimeAsync(400)
    // Delay after attempt 3: 100 * 2^3 = 800 (last attempt, no more retries)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('throws the last error if all attempts fail', async () => {
    const errors = [
      new Error('error 1'),
      new Error('error 2'),
      new Error('final error'),
    ]
    let callCount = 0

    const fn = vi.fn().mockImplementation(() => {
      return Promise.reject(errors[callCount++])
    })

    const resultPromise = retry(fn, 3, 100)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)

    await expect(resultPromise).rejects.toThrow('final error')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('works with maxAttempts of 1 (no retries)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 1, 100)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('succeeds on last retry attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const resultPromise = retry(fn, 3, 100)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
