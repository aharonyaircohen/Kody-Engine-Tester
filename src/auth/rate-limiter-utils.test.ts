import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, clearRateLimitStore } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    clearRateLimitStore()
  })

  afterEach(() => {
    clearRateLimitStore()
  })

  it('allows first request for a new key', () => {
    const result = checkRateLimit('test-key', 5, 1000)

    expect(result).toEqual({ allowed: true })
  })

  it('allows requests within the limit', () => {
    const key = 'test-key'
    const maxRequests = 3
    const windowMs = 1000

    expect(checkRateLimit(key, maxRequests, windowMs)).toEqual({ allowed: true })
    expect(checkRateLimit(key, maxRequests, windowMs)).toEqual({ allowed: true })
    expect(checkRateLimit(key, maxRequests, windowMs)).toEqual({ allowed: true })
  })

  it('blocks requests exceeding the limit', () => {
    const key = 'test-key'
    const maxRequests = 2
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)
    checkRateLimit(key, maxRequests, windowMs)
    const result = checkRateLimit(key, maxRequests, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('resets after the window expires', () => {
    vi.useFakeTimers()
    const key = 'test-key'
    const maxRequests = 2
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)
    checkRateLimit(key, maxRequests, windowMs)
    expect(checkRateLimit(key, maxRequests, windowMs).allowed).toBe(false)

    vi.advanceTimersByTime(windowMs)

    const result = checkRateLimit(key, maxRequests, windowMs)
    expect(result.allowed).toBe(true)

    vi.useRealTimers()
  })

  it('tracks different keys independently', () => {
    const maxRequests = 2
    const windowMs = 1000

    checkRateLimit('key-a', maxRequests, windowMs)
    checkRateLimit('key-a', maxRequests, windowMs)
    checkRateLimit('key-b', maxRequests, windowMs)
    checkRateLimit('key-b', maxRequests, windowMs)

    const resultA = checkRateLimit('key-a', maxRequests, windowMs)
    const resultB = checkRateLimit('key-b', maxRequests, windowMs)

    expect(resultA.allowed).toBe(false)
    expect(resultB.allowed).toBe(false)
  })

  it('returns correct retryAfter value', () => {
    vi.useFakeTimers()
    const key = 'test-key'
    const maxRequests = 1
    const windowMs = 5000

    checkRateLimit(key, maxRequests, windowMs)

    vi.advanceTimersByTime(2000)

    const result = checkRateLimit(key, maxRequests, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(3)

    vi.useRealTimers()
  })
})