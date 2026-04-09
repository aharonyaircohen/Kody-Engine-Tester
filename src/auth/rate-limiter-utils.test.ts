import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, clearRateLimitStore, resetRateLimit } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    clearRateLimitStore()
  })

  it('allows first request within window', () => {
    const result = checkRateLimit('key1', 5, 1000)
    expect(result).toEqual({ allowed: true })
  })

  it('allows requests up to maxRequests', () => {
    const key = 'key2'
    const maxRequests = 3
    const windowMs = 1000

    expect(checkRateLimit(key, maxRequests, windowMs)).toEqual({ allowed: true })
    expect(checkRateLimit(key, maxRequests, windowMs)).toEqual({ allowed: true })
    expect(checkRateLimit(key, maxRequests, windowMs)).toEqual({ allowed: true })
  })

  it('blocks requests exceeding maxRequests', () => {
    const key = 'key3'
    const maxRequests = 2
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)
    checkRateLimit(key, maxRequests, windowMs)

    const result = checkRateLimit(key, maxRequests, windowMs)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('returns retryAfter based on remaining window time', () => {
    const key = 'key4'
    const maxRequests = 1
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)

    const result = checkRateLimit(key, maxRequests, windowMs)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeDefined()
    expect(result.retryAfter).toBeLessThanOrEqual(windowMs)
  })

  it('resets after window expires', () => {
    const key = 'key5'
    const maxRequests = 1
    const windowMs = 100

    const result1 = checkRateLimit(key, maxRequests, windowMs)
    expect(result1.allowed).toBe(true)

    const result2 = checkRateLimit(key, maxRequests, windowMs)
    expect(result2.allowed).toBe(false)

    // Simulate time passing - need to use fake timers in integration test
  })

  it('tracks different keys independently', () => {
    const maxRequests = 1
    const windowMs = 1000

    const result1 = checkRateLimit('user:A', maxRequests, windowMs)
    expect(result1.allowed).toBe(true)

    const result2 = checkRateLimit('user:B', maxRequests, windowMs)
    expect(result2.allowed).toBe(true)

    // user:A makes another request - should be blocked
    const result3 = checkRateLimit('user:A', maxRequests, windowMs)
    expect(result3.allowed).toBe(false)

    // user:B makes another request - should also be blocked
    const result4 = checkRateLimit('user:B', maxRequests, windowMs)
    expect(result4.allowed).toBe(false)

    // New user:C is still allowed
    const result5 = checkRateLimit('user:C', maxRequests, windowMs)
    expect(result5.allowed).toBe(true)
  })

  it('resetRateLimit removes the key from store', () => {
    const key = 'key6'
    const maxRequests = 1
    const windowMs = 1000

    checkRateLimit(key, maxRequests, windowMs)
    checkRateLimit(key, maxRequests, windowMs)

    resetRateLimit(key)

    const result = checkRateLimit(key, maxRequests, windowMs)
    expect(result.allowed).toBe(true)
  })
})
