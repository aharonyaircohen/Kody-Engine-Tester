import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  afterEach(() => {
    resetRateLimit()
  })

  it('allows requests when under the limit', () => {
    const result = checkRateLimit('ip:127.0.0.1', 5, 1000)

    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  it('allows multiple requests up to the limit', () => {
    const key = 'ip:127.0.0.1'
    const maxRequests = 3

    const result1 = checkRateLimit(key, maxRequests, 1000)
    const result2 = checkRateLimit(key, maxRequests, 1000)
    const result3 = checkRateLimit(key, maxRequests, 1000)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
    expect(result3.allowed).toBe(true)
  })

  it('denies requests when over the limit', () => {
    const key = 'ip:127.0.0.1'
    const maxRequests = 2
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)
    checkRateLimit(key, maxRequests, windowMs)
    const result = checkRateLimit(key, maxRequests, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('returns retryAfter in milliseconds', () => {
    const key = 'ip:127.0.0.1'
    const maxRequests = 1
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)
    const result = checkRateLimit(key, maxRequests, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThanOrEqual(0)
    expect(result.retryAfter).toBeLessThanOrEqual(windowMs)
  })

  it('tracks different keys independently', () => {
    const maxRequests = 2
    const windowMs = 1000

    // Exhaust limit for key1
    checkRateLimit('key1', maxRequests, windowMs)
    checkRateLimit('key1', maxRequests, windowMs)

    // key2 should still be allowed
    const result = checkRateLimit('key2', maxRequests, windowMs)

    expect(result.allowed).toBe(true)
  })

  it('uses default sliding window - old timestamps expire', () => {
    const key = 'ip:127.0.0.1'
    const maxRequests = 2
    const windowMs = 100

    // First two requests
    const result1 = checkRateLimit(key, maxRequests, windowMs)
    const result2 = checkRateLimit(key, maxRequests, windowMs)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)

    // Third request should be denied
    const result3 = checkRateLimit(key, maxRequests, windowMs)
    expect(result3.allowed).toBe(false)
  })

  it('resetRateLimit clears specific key', () => {
    const key = 'ip:127.0.0.1'
    const maxRequests = 1
    const windowMs = 1000

    // Exhaust limit
    checkRateLimit(key, maxRequests, windowMs)
    const denied = checkRateLimit(key, maxRequests, windowMs)
    expect(denied.allowed).toBe(false)

    // Reset and try again
    resetRateLimit(key)
    const allowed = checkRateLimit(key, maxRequests, windowMs)
    expect(allowed.allowed).toBe(true)
  })

  it('resetRateLimit without key clears all entries', () => {
    const maxRequests = 1
    const windowMs = 1000

    checkRateLimit('key1', maxRequests, windowMs)
    checkRateLimit('key2', maxRequests, windowMs)

    resetRateLimit()

    const result1 = checkRateLimit('key1', maxRequests, windowMs)
    const result2 = checkRateLimit('key2', maxRequests, windowMs)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
  })
})
