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
    await vi.advanceTimersByTimeAsync(1000) // first retry delay
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after maxAttempts have been exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    const resultPromise = retry(fn, 3, 1000)
    resultPromise.catch(() => {}) // suppress unhandled rejection

    // First attempt
    await vi.advanceTimersByTimeAsync(0)
    // Retry 1 - delay: 1000 * 2^0 = 1000
    await vi.advanceTimersByTimeAsync(1000)
    // Retry 2 - delay: 1000 * 2^1 = 2000
    await vi.advanceTimersByTimeAsync(2000)

    await expect(resultPromise).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('uses exponential backoff for delays', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 4, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0) // attempt 0
    await vi.advanceTimersByTimeAsync(1000) // delay after attempt 0: 1000 * 2^0 = 1000
    await vi.advanceTimersByTimeAsync(2000) // delay after attempt 1: 1000 * 2^1 = 2000
    await vi.advanceTimersByTimeAsync(4000) // delay after attempt 2: 1000 * 2^2 = 4000

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('throws the last error when all attempts fail', async () => {
    const errors = [
      new Error('error 1'),
      new Error('error 2'),
      new Error('final error'),
    ]
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

  it('succeeds on the last attempt with single retry', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const resultPromise = retry(fn, 2, 1000)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('handles non-Error rejections', async () => {
    const fn = vi.fn().mockRejectedValue('string error')

    const resultPromise = retry(fn, 2, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)

    await expect(resultPromise).rejects.toThrow('string error')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
