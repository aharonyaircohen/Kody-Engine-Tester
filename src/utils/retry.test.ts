import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { retry, retryWithBackoff } from './retry'

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('succeeds on first attempt when function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const resultPromise = retry(fn)
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

    const resultPromise = retry(fn, { maxRetries: 3 })
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // first retry delay
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries maxRetries times before throwing', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    const resultPromise = retry(fn, { maxRetries: 3 })
    resultPromise.catch(() => {}) // suppress unhandled rejection

    // First attempt
    await vi.advanceTimersByTimeAsync(0)
    // Retry 1
    await vi.advanceTimersByTimeAsync(1000)
    // Retry 2
    await vi.advanceTimersByTimeAsync(2000)
    // Retry 3
    await vi.advanceTimersByTimeAsync(4000)

    await expect(resultPromise).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(4) // initial + 3 retries
  })

  it('uses exponential backoff for delays', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, {
      maxRetries: 3,
      initialDelay: 1000,
      backoffFactor: 2,
    })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // delay after attempt 1
    await vi.advanceTimersByTimeAsync(2000) // delay after attempt 2 (1000 * 2)
    await vi.advanceTimersByTimeAsync(4000) // delay after attempt 3 (2000 * 2)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('caps delay at maxDelay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn, {
      maxRetries: 3,
      initialDelay: 10000,
      maxDelay: 15000,
      backoffFactor: 2,
    })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(10000) // delay capped at 15000 but initial is 10000
    await vi.advanceTimersByTimeAsync(15000) // delay capped at 15000 (20000 > 15000)
    await vi.advanceTimersByTimeAsync(15000) // delay capped at 15000 (40000 > 15000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('respects shouldRetry predicate', async () => {
    const retryableError = new Error('retryable')
    const nonRetryableError = new Error('non-retryable')

    const fn = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(nonRetryableError)

    const resultPromise = retry(fn, {
      maxRetries: 3,
      shouldRetry: (error) => error.message === 'retryable',
    })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // first retry

    await expect(resultPromise).rejects.toThrow('non-retryable')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('uses default options', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retry(fn)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(4000)
    await vi.advanceTimersByTimeAsync(8000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(4) // initial + 3 retries (default maxRetries=3)
  })

  it('rethrows the last error if all retries fail', async () => {
    const errors = [new Error('error 1'), new Error('error 2'), new Error('error 3'), new Error('final error')]
    let callCount = 0

    const fn = vi.fn().mockImplementation(() => {
      return Promise.reject(errors[callCount++])
    })

    const resultPromise = retry(fn, { maxRetries: 3 })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(4000)

    await expect(resultPromise).rejects.toThrow('final error')
    expect(fn).toHaveBeenCalledTimes(4)
  })
})

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('succeeds on first attempt when function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const resultPromise = retryWithBackoff(fn)
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

    const resultPromise = retryWithBackoff(fn, { maxAttempts: 3 })
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // first retry delay
    const result = await resultPromise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries maxAttempts times before throwing', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    const resultPromise = retryWithBackoff(fn, { maxAttempts: 3 })
    resultPromise.catch(() => {}) // suppress unhandled rejection

    // First attempt
    await vi.advanceTimersByTimeAsync(0)
    // Retry 1
    await vi.advanceTimersByTimeAsync(1000)
    // Retry 2
    await vi.advanceTimersByTimeAsync(2000)

    await expect(resultPromise).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries (maxAttempts=3)
  })

  it('uses exponential backoff for delays', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
    })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // delay after attempt 1
    await vi.advanceTimersByTimeAsync(2000) // delay after attempt 2 (1000 * 2)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('caps delay at maxDelay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retryWithBackoff(fn, {
      maxAttempts: 3,
      initialDelay: 10000,
      maxDelay: 15000,
      backoffMultiplier: 2,
    })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(10000) // delay capped at 15000 but initial is 10000
    await vi.advanceTimersByTimeAsync(15000) // delay capped at 15000 (20000 > 15000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('respects shouldRetry predicate', async () => {
    const retryableError = new Error('retryable')
    const nonRetryableError = new Error('non-retryable')

    const fn = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(nonRetryableError)

    const resultPromise = retryWithBackoff(fn, {
      maxAttempts: 3,
      shouldRetry: (error) => error.message === 'retryable',
    })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000) // first retry

    await expect(resultPromise).rejects.toThrow('non-retryable')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('uses default options', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const resultPromise = retryWithBackoff(fn)
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(4000)

    await expect(resultPromise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries (default maxAttempts=3)
  })

  it('rethrows the last error if all retries fail', async () => {
    const errors = [new Error('error 1'), new Error('error 2'), new Error('final error')]
    let callCount = 0

    const fn = vi.fn().mockImplementation(() => {
      return Promise.reject(errors[callCount++])
    })

    const resultPromise = retryWithBackoff(fn, { maxAttempts: 3 })
    resultPromise.catch(() => {})

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(resultPromise).rejects.toThrow('final error')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
