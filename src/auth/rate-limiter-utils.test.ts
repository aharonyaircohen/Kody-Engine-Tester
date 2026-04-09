import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  checkRateLimit,
  resetRateLimit,
  clearRateLimitStore,
  getRateLimitEntry,
} from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearRateLimitStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows first request for a new key', () => {
    const result = checkRateLimit('key-a', 3, 10_000)
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  it('allows requests under the limit', () => {
    checkRateLimit('key', 3, 10_000)
    checkRateLimit('key', 3, 10_000)
    const result = checkRateLimit('key', 3, 10_000)

    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  it('rejects requests over the limit', () => {
    checkRateLimit('key', 2, 10_000)
    checkRateLimit('key', 2, 10_000)

    const result = checkRateLimit('key', 2, 10_000)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('returns retryAfter in seconds', () => {
    checkRateLimit('key', 1, 5000)

    const result = checkRateLimit('key', 1, 5000)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(5)
  })

  it('tracks different keys independently', () => {
    checkRateLimit('key-a', 1, 10_000)
    checkRateLimit('key-b', 1, 10_000)

    expect(checkRateLimit('key-a', 1, 10_000).allowed).toBe(false)
    expect(checkRateLimit('key-b', 1, 10_000).allowed).toBe(false)
    expect(checkRateLimit('key-c', 1, 10_000).allowed).toBe(true)
  })

  it('resets after window expires', () => {
    checkRateLimit('key', 1, 1000)
    expect(checkRateLimit('key', 1, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(1001)

    const result = checkRateLimit('key', 1, 1000)
    expect(result.allowed).toBe(true)
  })

  it('resets entry after window expires even when exhausted', () => {
    checkRateLimit('key', 2, 1000)
    checkRateLimit('key', 2, 1000)
    expect(checkRateLimit('key', 2, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(1001)

    const result = checkRateLimit('key', 2, 1000)
    expect(result.allowed).toBe(true)
  })

  it('allows exactly maxRequests number of requests', () => {
    const result1 = checkRateLimit('key', 3, 10_000)
    const result2 = checkRateLimit('key', 3, 10_000)
    const result3 = checkRateLimit('key', 3, 10_000)
    const result4 = checkRateLimit('key', 3, 10_000)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
    expect(result3.allowed).toBe(true)
    expect(result4.allowed).toBe(false)
  })

  it('uses correct windowMs for expiration', () => {
    vi.setSystemTime(1000)
    checkRateLimit('key', 2, 5000)
    checkRateLimit('key', 2, 5000)

    // At 4999ms, entry still valid (resetAt = 6000)
    vi.advanceTimersByTime(4999)
    expect(checkRateLimit('key', 2, 5000).allowed).toBe(false)

    // At 5000ms exactly, entry expired and fresh window starts
    vi.advanceTimersByTime(1)
    expect(checkRateLimit('key', 2, 5000).allowed).toBe(true)
  })
})

describe('resetRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearRateLimitStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resets a specific key', () => {
    checkRateLimit('key', 1, 10_000)
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(false)

    resetRateLimit('key')

    const result = checkRateLimit('key', 1, 10_000)
    expect(result.allowed).toBe(true)
  })

  it('only resets the specified key', () => {
    checkRateLimit('key-a', 1, 10_000)
    checkRateLimit('key-b', 1, 10_000)

    resetRateLimit('key-a')

    expect(checkRateLimit('key-a', 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit('key-b', 1, 10_000).allowed).toBe(false)
  })
})

describe('clearRateLimitStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears all entries', () => {
    checkRateLimit('key-a', 1, 10_000)
    checkRateLimit('key-b', 1, 10_000)

    clearRateLimitStore()

    expect(checkRateLimit('key-a', 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit('key-b', 1, 10_000).allowed).toBe(true)
  })
})

describe('getRateLimitEntry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearRateLimitStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for non-existent key', () => {
    expect(getRateLimitEntry('nonexistent')).toBeUndefined()
  })

  it('returns entry for existing key', () => {
    vi.setSystemTime(1000)
    checkRateLimit('key', 5, 10000)

    const entry = getRateLimitEntry('key')

    expect(entry).toEqual({
      count: 1,
      resetAt: 11000,
    })
  })

  it('reflects updated count after multiple requests', () => {
    vi.setSystemTime(1000)
    checkRateLimit('key', 5, 10000)
    checkRateLimit('key', 5, 10000)
    checkRateLimit('key', 5, 10000)

    const entry = getRateLimitEntry('key')

    expect(entry?.count).toBe(3)
  })

  it('entry expires and resets count', () => {
    vi.setSystemTime(1000)
    checkRateLimit('key', 5, 1000)
    checkRateLimit('key', 5, 1000)

    expect(getRateLimitEntry('key')?.count).toBe(2)

    vi.advanceTimersByTime(1001)

    checkRateLimit('key', 5, 1000)

    expect(getRateLimitEntry('key')?.count).toBe(1)
  })
})
