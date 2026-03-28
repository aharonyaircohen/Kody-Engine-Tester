import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  SlidingWindowRateLimiter,
  createRateLimiterMiddleware,
  byApiKey,
} from './rate-limiter'

describe('SlidingWindowRateLimiter', () => {
  let limiter: SlidingWindowRateLimiter

  afterEach(() => {
    limiter?.destroy()
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    limiter = new SlidingWindowRateLimiter({ maxRequests: 3, windowMs: 10_000 })
    const r1 = limiter.check('key')
    const r2 = limiter.check('key')
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r1.remaining).toBe(2)
    expect(r2.remaining).toBe(1)
  })

  it('rejects requests over the limit', () => {
    limiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 10_000 })
    limiter.check('key')
    limiter.check('key')
    const r3 = limiter.check('key')
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
    expect(r3.retryAfterMs).toBeGreaterThan(0)
  })

  it('sliding window expires old requests', () => {
    vi.useFakeTimers()
    limiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 1000 })
    limiter.check('key')
    limiter.check('key')
    expect(limiter.check('key').allowed).toBe(false)

    vi.advanceTimersByTime(1001)
    const result = limiter.check('key')
    expect(result.allowed).toBe(true)
  })

  it('tracks multiple keys independently', () => {
    limiter = new SlidingWindowRateLimiter({ maxRequests: 1, windowMs: 10_000 })
    limiter.check('ip-a')
    expect(limiter.check('ip-a').allowed).toBe(false)
    expect(limiter.check('ip-b').allowed).toBe(true)
  })

  it('returns correct remaining count', () => {
    limiter = new SlidingWindowRateLimiter({ maxRequests: 5, windowMs: 10_000 })
    limiter.check('key')
    limiter.check('key')
    const r3 = limiter.check('key')
    expect(r3.remaining).toBe(2)
  })

  it('retryAfterMs reflects time until oldest request expires', () => {
    vi.useFakeTimers()
    limiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 5000 })
    limiter.check('key')
    vi.advanceTimersByTime(1000)
    limiter.check('key')
    vi.advanceTimersByTime(500)
    const result = limiter.check('key')
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBe(3500)
  })

  it('cleanup removes expired entries', () => {
    vi.useFakeTimers()
    limiter = new SlidingWindowRateLimiter({ maxRequests: 5, windowMs: 1000 })
    limiter.check('key')
    expect(limiter.size).toBe(1)

    vi.advanceTimersByTime(1001)
    limiter.cleanup()
    expect(limiter.size).toBe(0)
  })

  it('cleanup preserves active entries', () => {
    vi.useFakeTimers()
    limiter = new SlidingWindowRateLimiter({ maxRequests: 5, windowMs: 1000 })
    limiter.check('key')

    vi.advanceTimersByTime(500)
    limiter.cleanup()
    expect(limiter.size).toBe(1)
  })
})

describe('createRateLimiterMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(ip: string, headers?: Record<string, string>): NextRequest {
    const req = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip, ...headers },
    })
    return req
  }

  it('allows requests under the limit', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 5, windowMs: 10_000 })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).not.toBe(429)
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4')
    mw.limiter.destroy()
  })

  it('returns 429 with Retry-After header when limit exceeded', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 1, windowMs: 10_000 })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(429)
    const retryAfter = Number(res.headers.get('Retry-After'))
    expect(retryAfter).toBeGreaterThan(0)
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
    mw.limiter.destroy()
  })

  it('tracks different IPs independently', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 1, windowMs: 10_000 })
    const r1 = mw(makeRequest('1.2.3.4'))
    const r2 = mw(makeRequest('5.6.7.8'))
    expect(r1.status).not.toBe(429)
    expect(r2.status).not.toBe(429)
    mw.limiter.destroy()
  })

  it('supports API key-based resolution', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      keyResolver: byApiKey,
    })
    mw(makeRequest('1.2.3.4', { 'x-api-key': 'abc' }))
    const res = mw(makeRequest('5.6.7.8', { 'x-api-key': 'abc' }))
    expect(res.status).toBe(429)
    mw.limiter.destroy()
  })

  it('allows requests when key resolver returns null', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      keyResolver: () => null,
    })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).not.toBe(429)
    mw.limiter.destroy()
  })
})

describe('IP whitelist', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(ip: string): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    })
  }

  it('allows whitelisted IPs to bypass rate limiting', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipWhitelist: ['1.2.3.4'],
    })
    // Exhaust the limit
    mw(makeRequest('1.2.3.4'))
    // Whitelisted IP should still be allowed
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).not.toBe(429)
    mw.limiter.destroy()
  })

  it('non-whitelisted IPs are still rate limited', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipWhitelist: ['5.6.7.8'],
    })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(429)
    mw.limiter.destroy()
  })

  it('whitelist takes precedence over blacklist', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipWhitelist: ['1.2.3.4'],
      ipBlacklist: ['1.2.3.4'],
    })
    const res = mw(makeRequest('1.2.3.4'))
    // Whitelist should allow through (not 403, not 429)
    expect(res.status).not.toBe(403)
    expect(res.status).not.toBe(429)
    mw.limiter.destroy()
  })
})

describe('IP blacklist', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(ip: string): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    })
  }

  it('blacklisted IPs receive 403 Forbidden', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipBlacklist: ['1.2.3.4'],
    })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(403)
    mw.limiter.destroy()
  })

  it('non-blacklisted IPs are not affected', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipBlacklist: ['9.9.9.9'],
    })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).not.toBe(403)
    mw.limiter.destroy()
  })
})

describe('Concurrent request handling', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles rapid sequential requests within window', () => {
    vi.useFakeTimers()
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 5, windowMs: 1000 })

    // Simulate rapid sequential requests
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) {
      results.push(localLimiter.check('key').allowed)
    }
    expect(results).toEqual([true, true, true, true, true])

    // 6th request should be blocked
    const sixth = localLimiter.check('key')
    expect(sixth.allowed).toBe(false)
    expect(sixth.remaining).toBe(0)

    localLimiter.destroy()
    vi.useRealTimers()
  })

  it('allows requests after partial window expiry', () => {
    vi.useFakeTimers()
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 3, windowMs: 1000 })

    // Make 3 requests
    localLimiter.check('key')
    localLimiter.check('key')
    localLimiter.check('key')
    expect(localLimiter.check('key').allowed).toBe(false)

    // Advance time by 600ms (only some requests expired)
    vi.advanceTimersByTime(600)
    expect(localLimiter.check('key').allowed).toBe(false) // Still 3 active requests

    // Advance to 1001ms total (all requests expired)
    vi.advanceTimersByTime(401)
    expect(localLimiter.check('key').allowed).toBe(true)

    localLimiter.destroy()
    vi.useRealTimers()
  })

  it('correctly tracks concurrent requests from multiple keys', () => {
    vi.useFakeTimers()
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 1000 })

    // Exhaust limit for IP A
    localLimiter.check('ip-a')
    localLimiter.check('ip-a')
    expect(localLimiter.check('ip-a').allowed).toBe(false)

    // IP B should still have full quota
    expect(localLimiter.check('ip-b').allowed).toBe(true)
    expect(localLimiter.check('ip-b').allowed).toBe(true)
    expect(localLimiter.check('ip-b').allowed).toBe(false)

    // Both IPs now exhausted
    expect(localLimiter.check('ip-a').allowed).toBe(false)
    expect(localLimiter.check('ip-b').allowed).toBe(false)

    // After expiry, both should recover independently
    vi.advanceTimersByTime(1001)
    expect(localLimiter.check('ip-a').allowed).toBe(true)
    expect(localLimiter.check('ip-b').allowed).toBe(true)

    localLimiter.destroy()
    vi.useRealTimers()
  })

  it('handles requests exactly at window boundary', () => {
    vi.useFakeTimers()
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 1000 })

    localLimiter.check('key')
    localLimiter.check('key')
    expect(localLimiter.check('key').allowed).toBe(false)

    // At exactly 1000ms, requests should still be blocked
    vi.advanceTimersByTime(999)
    expect(localLimiter.check('key').allowed).toBe(false)

    // At 1000ms+, oldest requests expire
    vi.advanceTimersByTime(2)
    expect(localLimiter.check('key').allowed).toBe(true)

    localLimiter.destroy()
    vi.useRealTimers()
  })
})

describe('Window expiry reset', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resets counter after window expires', () => {
    vi.useFakeTimers()
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 2, windowMs: 1000 })

    // Exhaust limit
    localLimiter.check('key')
    localLimiter.check('key')
    expect(localLimiter.check('key').allowed).toBe(false)

    // Wait for window to expire
    vi.advanceTimersByTime(1001)

    // Should be allowed again
    const result = localLimiter.check('key')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)

    localLimiter.destroy()
    vi.useRealTimers()
  })

  it('reset method clears specific key', () => {
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 1, windowMs: 10_000 })
    localLimiter.check('key')
    expect(localLimiter.check('key').allowed).toBe(false)

    localLimiter.reset('key')
    expect(localLimiter.check('key').allowed).toBe(true)
    localLimiter.destroy()
  })

  it('reset method clears all keys when no key provided', () => {
    vi.useFakeTimers()
    const localLimiter = new SlidingWindowRateLimiter({ maxRequests: 1, windowMs: 10_000 })
    localLimiter.check('ip-a')
    localLimiter.check('ip-b')
    expect(localLimiter.size).toBe(2)

    localLimiter.reset()
    expect(localLimiter.size).toBe(0)

    localLimiter.destroy()
    vi.useRealTimers()
  })
})

describe('Rate limit headers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(ip: string): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    })
  }

  it('adds X-RateLimit-Limit header with correct value', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 10, windowMs: 10_000 })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.headers.get('X-RateLimit-Limit')).toBe('10')
    mw.limiter.destroy()
  })

  it('adds X-RateLimit-Remaining header that decrements correctly', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 5, windowMs: 10_000 })

    const r1 = mw(makeRequest('1.2.3.4'))
    expect(r1.headers.get('X-RateLimit-Remaining')).toBe('4')

    const r2 = mw(makeRequest('1.2.3.4'))
    expect(r2.headers.get('X-RateLimit-Remaining')).toBe('3')

    const r3 = mw(makeRequest('1.2.3.4'))
    expect(r3.headers.get('X-RateLimit-Remaining')).toBe('2')

    const r4 = mw(makeRequest('1.2.3.4'))
    expect(r4.headers.get('X-RateLimit-Remaining')).toBe('1')

    const r5 = mw(makeRequest('1.2.3.4'))
    expect(r5.headers.get('X-RateLimit-Remaining')).toBe('0')

    mw.limiter.destroy()
  })

  it('includes Retry-After header on 429 responses', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 1, windowMs: 10_000 })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(429)
    const retryAfter = Number(res.headers.get('Retry-After'))
    expect(retryAfter).toBeGreaterThan(0)
    expect(retryAfter).toBeLessThanOrEqual(10)
    mw.limiter.destroy()
  })
})

describe('X-RateLimit-Reset header', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(ip: string): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip },
    })
  }

  it('sets X-RateLimit-Reset on allowed responses by default', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 5, windowMs: 10_000 })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.headers.has('X-RateLimit-Reset')).toBe(true)
    const reset = Number(res.headers.get('X-RateLimit-Reset'))
    // Reset should be >= current Unix timestamp (for allowed, retryAfterMs=0 so reset ≈ now)
    expect(reset).toBeGreaterThanOrEqual(Math.ceil(Date.now() / 1000))
    mw.limiter.destroy()
  })

  it('sets X-RateLimit-Reset on rate-limited responses', () => {
    const mw = createRateLimiterMiddleware({ maxRequests: 1, windowMs: 10_000 })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.headers.has('X-RateLimit-Reset')).toBe(true)
    const reset = Number(res.headers.get('X-RateLimit-Reset'))
    expect(reset).toBeGreaterThan(Math.ceil(Date.now() / 1000))
    mw.limiter.destroy()
  })

  it('does not set X-RateLimit-Reset when enableRateLimitHeaders is false', () => {
    const mw = createRateLimiterMiddleware({
      maxRequests: 5,
      windowMs: 10_000,
      enableRateLimitHeaders: false,
    })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.headers.has('X-RateLimit-Reset')).toBe(false)
    mw.limiter.destroy()
  })

  it('X-RateLimit-Reset is a Unix timestamp in seconds', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-27T21:00:00Z'))
    const mw = createRateLimiterMiddleware({ maxRequests: 1, windowMs: 10_000 })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    const reset = Number(res.headers.get('X-RateLimit-Reset'))
    // reset should be ~Date.now() + retryAfterMs in seconds
    expect(Number.isInteger(reset)).toBe(true)
    mw.limiter.destroy()
    vi.useRealTimers()
  })
})
