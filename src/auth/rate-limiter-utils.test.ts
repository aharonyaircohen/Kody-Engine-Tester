import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  getRateLimitStoreSize,
} from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    const result1 = checkRateLimit('key', 3, 10_000)
    const result2 = checkRateLimit('key', 3, 10_000)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
    expect(result1.retryAfter).toBeUndefined()
    expect(result2.retryAfter).toBeUndefined()
  })

  it('rejects requests over the limit', () => {
    checkRateLimit('key', 2, 10_000)
    checkRateLimit('key', 2, 10_000)
    const result = checkRateLimit('key', 2, 10_000)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('sliding window expires old requests', () => {
    checkRateLimit('key', 2, 1000)
    checkRateLimit('key', 2, 1000)
    expect(checkRateLimit('key', 2, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(1001)
    const result = checkRateLimit('key', 2, 1000)
    expect(result.allowed).toBe(true)
  })

  it('tracks multiple keys independently', () => {
    checkRateLimit('ip-a', 1, 10_000)
    expect(checkRateLimit('ip-a', 1, 10_000).allowed).toBe(false)
    expect(checkRateLimit('ip-b', 1, 10_000).allowed).toBe(true)
  })

  it('retryAfter reflects time until oldest request expires', () => {
    checkRateLimit('key', 2, 5000)
    vi.advanceTimersByTime(1000)
    checkRateLimit('key', 2, 5000)
    vi.advanceTimersByTime(500)
    const result = checkRateLimit('key', 2, 5000)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(3500)
  })

  it('handles rapid sequential requests within window', () => {
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) {
      results.push(checkRateLimit('key', 5, 1000).allowed)
    }
    expect(results).toEqual([true, true, true, true, true])

    const sixth = checkRateLimit('key', 5, 1000)
    expect(sixth.allowed).toBe(false)
  })

  it('allows requests after partial window expiry', () => {
    checkRateLimit('key', 3, 1000)
    checkRateLimit('key', 3, 1000)
    checkRateLimit('key', 3, 1000)
    expect(checkRateLimit('key', 3, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(600)
    expect(checkRateLimit('key', 3, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(401)
    expect(checkRateLimit('key', 3, 1000).allowed).toBe(true)
  })

  it('handles requests exactly at window boundary', () => {
    checkRateLimit('key', 2, 1000)
    checkRateLimit('key', 2, 1000)
    expect(checkRateLimit('key', 2, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(999)
    expect(checkRateLimit('key', 2, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(2)
    expect(checkRateLimit('key', 2, 1000).allowed).toBe(true)
  })

  it('correctly tracks concurrent requests from multiple keys', () => {
    checkRateLimit('ip-a', 2, 1000)
    checkRateLimit('ip-a', 2, 1000)
    expect(checkRateLimit('ip-a', 2, 1000).allowed).toBe(false)

    expect(checkRateLimit('ip-b', 2, 1000).allowed).toBe(true)
    expect(checkRateLimit('ip-b', 2, 1000).allowed).toBe(true)
    expect(checkRateLimit('ip-b', 2, 1000).allowed).toBe(false)

    expect(checkRateLimit('ip-a', 2, 1000).allowed).toBe(false)
    expect(checkRateLimit('ip-b', 2, 1000).allowed).toBe(false)

    vi.advanceTimersByTime(1001)
    expect(checkRateLimit('ip-a', 2, 1000).allowed).toBe(true)
    expect(checkRateLimit('ip-b', 2, 1000).allowed).toBe(true)
  })
})

describe('resetRateLimit', () => {
  beforeEach(() => {
    clearAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resets counter for specific key', () => {
    checkRateLimit('key', 1, 10_000)
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(false)

    resetRateLimit('key')
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(true)
  })

  it('does not affect other keys', () => {
    checkRateLimit('ip-a', 1, 10_000)
    checkRateLimit('ip-b', 1, 10_000)

    resetRateLimit('ip-a')
    expect(checkRateLimit('ip-a', 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit('ip-b', 1, 10_000).allowed).toBe(false)
  })
})

describe('clearAllRateLimits', () => {
  beforeEach(() => {
    clearAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears all rate limit counters', () => {
    checkRateLimit('ip-a', 1, 10_000)
    checkRateLimit('ip-b', 1, 10_000)
    expect(getRateLimitStoreSize()).toBe(2)

    clearAllRateLimits()
    expect(getRateLimitStoreSize()).toBe(0)
  })
})

describe('getRateLimitStoreSize', () => {
  beforeEach(() => {
    clearAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct number of tracked keys', () => {
    expect(getRateLimitStoreSize()).toBe(0)

    checkRateLimit('key1', 1, 10_000)
    expect(getRateLimitStoreSize()).toBe(1)

    checkRateLimit('key2', 1, 10_000)
    expect(getRateLimitStoreSize()).toBe(2)
  })

  it('removes key from store count when window expires', () => {
    vi.useFakeTimers()
    checkRateLimit('key', 1, 1000)
    expect(getRateLimitStoreSize()).toBe(1)

    vi.advanceTimersByTime(1001)
    checkRateLimit('key', 1, 1000)
    expect(getRateLimitStoreSize()).toBe(1)
  })
})