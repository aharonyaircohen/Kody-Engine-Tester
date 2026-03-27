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
