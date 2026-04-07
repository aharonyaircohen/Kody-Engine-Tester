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

    await expect(resultPromise).rejects.toThrow('always fails')
    // 1 initial + 2 retries = 3 attempts (maxAttempts=3)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('uses exponential backoff for delays', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 4, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    // Delay after attempt 0: 1000 * 2^0 = 1000
    await vi.advanceTimersByTimeAsync(1000)
    // Delay after attempt 1: 1000 * 2^1 = 2000
    await vi.advanceTimersByTimeAsync(2000)
    // Delay after attempt 2: 1000 * 2^2 = 4000
    await vi.advanceTimersByTimeAsync(4000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('succeeds on the last attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValueOnce('success')

    const resultPromise = retry(fn, 3, 1000)
    await vi.advanceTimersByTimeAsync(0)
    // Attempt 0 fails -> delay 1000ms
    await vi.advanceTimersByTimeAsync(1000)
    // Attempt 1 fails -> delay 2000ms
    await vi.advanceTimersByTimeAsync(2000)
    // Attempt 2 succeeds
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('throws immediately when maxAttempts is 1', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 1, 1000)
    resultPromise.catch(() => {}) // suppress unhandled rejection
    await vi.advanceTimersByTimeAsync(0)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(1)
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

  it('handles non-Error rejections', async () => {
    const fn = vi.fn().mockRejectedValue('string error')

    const resultPromise = retry(fn, 2, 1000)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)

    await expect(resultPromise).rejects.toThrow('string error')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('works with different delay values', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, 3, 500)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    // Delay 1: 500 * 2^0 = 500
    await vi.advanceTimersByTimeAsync(500)
    // Delay 2: 500 * 2^1 = 1000
    await vi.advanceTimersByTimeAsync(1000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('works with async functions that return complex values', async () => {
    const complexResult = { data: { items: [1, 2, 3] }, status: 200 }
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(complexResult)

    const resultPromise = retry(fn, 2, 1000)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)

    const result = await resultPromise
    expect(result).toEqual(complexResult)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('first attempt happens at t=0 without pre-delay', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const resultPromise = retry(fn, 3, 1000)
    await vi.advanceTimersByTimeAsync(0)

    const result = await resultPromise
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
