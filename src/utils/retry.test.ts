import { describe, it, expect, beforeEach, vi } from 'vitest'
import { retry } from './retry'

describe('retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute the function successfully on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('attempt 1'))
      .mockRejectedValueOnce(new Error('attempt 2'))
      .mockResolvedValueOnce('success')

    const result = await retry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should throw after exhausting maxRetries', async () => {
    const error = new Error('persistent error')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(retry(fn, { maxRetries: 2 })).rejects.toThrow('persistent error')
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it('should use exponential backoff with default options', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('attempt 1'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn)

    // First call happens immediately
    expect(fn).toHaveBeenCalledTimes(1)

    // Fast-forward to first retry (1000ms default)
    await vi.advanceTimersByTimeAsync(1000)
    expect(fn).toHaveBeenCalledTimes(2)

    const result = await promise
    expect(result).toBe('success')

    vi.useRealTimers()
  })

  it('should double delay on each retry (exponential backoff)', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn, { initialDelay: 100, maxRetries: 3 })

    // Initial attempt
    expect(fn).toHaveBeenCalledTimes(1)

    // First retry at 100ms
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // Second retry at 100ms * 2 = 200ms later
    await vi.advanceTimersByTimeAsync(200)
    expect(fn).toHaveBeenCalledTimes(3)

    const result = await promise
    expect(result).toBe('success')

    vi.useRealTimers()
  })

  it('should cap delay at maxDelay', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockRejectedValueOnce(new Error('3'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn, {
      initialDelay: 100,
      maxDelay: 250,
      maxRetries: 4,
      backoffFactor: 2,
    })

    // Initial attempt
    expect(fn).toHaveBeenCalledTimes(1)

    // First retry: 100ms
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // Second retry: 200ms (100 * 2)
    await vi.advanceTimersByTimeAsync(200)
    expect(fn).toHaveBeenCalledTimes(3)

    // Third retry: should be 250ms (capped, not 400ms)
    await vi.advanceTimersByTimeAsync(250)
    expect(fn).toHaveBeenCalledTimes(4)

    const result = await promise
    expect(result).toBe('success')

    vi.useRealTimers()
  })

  it('should support custom backoffFactor', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn, {
      initialDelay: 100,
      backoffFactor: 3,
      maxRetries: 3,
    })

    expect(fn).toHaveBeenCalledTimes(1)

    // First retry: 100ms
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // Second retry: 300ms (100 * 3)
    await vi.advanceTimersByTimeAsync(300)
    expect(fn).toHaveBeenCalledTimes(3)

    const result = await promise
    expect(result).toBe('success')

    vi.useRealTimers()
  })

  it('should respect shouldRetry predicate', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockRejectedValueOnce(new Error('permanent'))

    const shouldRetry = (error: Error) => error.message === 'transient'

    await expect(
      retry(fn, { maxRetries: 3, shouldRetry })
    ).rejects.toThrow('permanent')

    // Should only be called twice: initial + one retry (not more despite maxRetries)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should not retry if shouldRetry returns false for first error', async () => {
    const error = new Error('non-retryable')
    const fn = vi.fn().mockRejectedValue(error)
    const shouldRetry = vi.fn().mockReturnValue(false)

    await expect(
      retry(fn, { maxRetries: 5, shouldRetry })
    ).rejects.toThrow('non-retryable')

    expect(fn).toHaveBeenCalledTimes(1)
    expect(shouldRetry).toHaveBeenCalledWith(error)
  })

  it('should handle generic types correctly', async () => {
    interface User {
      id: number
      name: string
    }

    const user: User = { id: 1, name: 'John' }
    const fn = vi.fn().mockResolvedValue(user)

    const result = await retry(fn)
    expect(result.id).toBe(1)
    expect(result.name).toBe('John')
  })

  it('should use default options when not provided', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn)

    expect(fn).toHaveBeenCalledTimes(1)

    // Default initialDelay is 1000ms
    await vi.advanceTimersByTimeAsync(1000)
    expect(fn).toHaveBeenCalledTimes(2)

    const result = await promise
    expect(result).toBe('success')

    vi.useRealTimers()
  })

  it('should rethrow the last error', async () => {
    const error1 = new Error('first error')
    const error2 = new Error('second error')
    const error3 = new Error('final error')

    const fn = vi.fn()
      .mockRejectedValueOnce(error1)
      .mockRejectedValueOnce(error2)
      .mockRejectedValueOnce(error3)

    await expect(retry(fn, { maxRetries: 2 })).rejects.toThrow('final error')
  })
})
