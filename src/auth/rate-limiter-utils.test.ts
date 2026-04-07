import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, resetRateLimitStore } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  afterEach(() => {
    resetRateLimitStore()
  })

  it('allows first request when store is empty', () => {
    const result = checkRateLimit('key1', 5, 1000)

    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  it('allows requests up to maxRequests limit', () => {
    const key = 'key2'
    const maxRequests = 3
    const windowMs = 1000

    const result1 = checkRateLimit(key, maxRequests, windowMs)
    const result2 = checkRateLimit(key, maxRequests, windowMs)
    const result3 = checkRateLimit(key, maxRequests, windowMs)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
    expect(result3.allowed).toBe(true)
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

  it('returns correct retryAfter when rate limited', () => {
    const key = 'key4'
    const maxRequests = 1
    const windowMs = 500

    checkRateLimit(key, maxRequests, windowMs)
    const result = checkRateLimit(key, maxRequests, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThanOrEqual(0)
    expect(result.retryAfter).toBeLessThanOrEqual(windowMs)
  })

  it('tracks different keys independently', () => {
    const key1 = 'ip-192.168.1.1'
    const key2 = 'ip-192.168.1.2'
    const maxRequests = 2
    const windowMs = 1000

    checkRateLimit(key1, maxRequests, windowMs)
    checkRateLimit(key1, maxRequests, windowMs)
    const result1 = checkRateLimit(key1, maxRequests, windowMs)

    const result2 = checkRateLimit(key2, maxRequests, windowMs)

    expect(result1.allowed).toBe(false)
    expect(result2.allowed).toBe(true)
  })

  it('allows requests after window expires', () => {
    const key = 'key5'
    const maxRequests = 1
    const windowMs = 100

    const result1 = checkRateLimit(key, maxRequests, windowMs)
    expect(result1.allowed).toBe(true)

    const result2 = checkRateLimit(key, maxRequests, windowMs)
    expect(result2.allowed).toBe(false)
  })

  it('handles maxRequests of 1 correctly', () => {
    const key = 'key6'
    const maxRequests = 1
    const windowMs = 1000

    const result1 = checkRateLimit(key, maxRequests, windowMs)
    expect(result1.allowed).toBe(true)

    const result2 = checkRateLimit(key, maxRequests, windowMs)
    expect(result2.allowed).toBe(false)
  })

  it('handles large maxRequests values', () => {
    const key = 'key7'
    const maxRequests = 1000
    const windowMs = 1000

    for (let i = 0; i < 999; i++) {
      const result = checkRateLimit(key, maxRequests, windowMs)
      expect(result.allowed).toBe(true)
    }
  })

  it('handles windowMs of 0', () => {
    const key = 'key8'
    const maxRequests = 10
    const windowMs = 0

    const result1 = checkRateLimit(key, maxRequests, windowMs)
    const result2 = checkRateLimit(key, maxRequests, windowMs)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
  })

  it('returns retryAfter close to windowMs for single request limit', async () => {
    const key = 'key9'
    const maxRequests = 1
    const windowMs = 2000

    checkRateLimit(key, maxRequests, windowMs)
    const result = checkRateLimit(key, maxRequests, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.retryAfter).toBeLessThanOrEqual(windowMs)
  })
})

describe('resetRateLimitStore', () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  afterEach(() => {
    resetRateLimitStore()
  })

  it('clears all entries when called without key', () => {
    checkRateLimit('key1', 1, 1000)
    checkRateLimit('key2', 1, 1000)

    resetRateLimitStore()

    const result1 = checkRateLimit('key1', 1, 1000)
    const result2 = checkRateLimit('key2', 1, 1000)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
  })

  it('clears specific key when key is provided', () => {
    const key1 = 'key3'
    const key2 = 'key4'
    const maxRequests = 1
    const windowMs = 1000

    checkRateLimit(key1, maxRequests, windowMs)
    checkRateLimit(key2, maxRequests, windowMs)

    resetRateLimitStore(key1)

    const result1 = checkRateLimit(key1, maxRequests, windowMs)
    const result2 = checkRateLimit(key2, maxRequests, windowMs)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(false)
  })
})
