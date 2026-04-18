import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { SimpleRateLimiter, createRateLimitMiddleware } from './rateLimit'

describe('SimpleRateLimiter', () => {
  let limiter: SimpleRateLimiter

  afterEach(() => {
    limiter?.destroy()
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    limiter = new SimpleRateLimiter({ maxRequests: 3, windowMs: 10_000 })
    const r1 = limiter.check('key')
    const r2 = limiter.check('key')
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r1.remaining).toBe(2)
    expect(r2.remaining).toBe(1)
  })

  it('rejects requests over the limit', () => {
    limiter = new SimpleRateLimiter({ maxRequests: 2, windowMs: 10_000 })
    limiter.check('key')
    limiter.check('key')
    const r3 = limiter.check('key')
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
    expect(r3.retryAfterMs).toBeGreaterThan(0)
  })

  it('resets after window expiry', () => {
    vi.useFakeTimers()
    limiter = new SimpleRateLimiter({ maxRequests: 2, windowMs: 1000 })
    limiter.check('key')
    limiter.check('key')
    expect(limiter.check('key').allowed).toBe(false)

    vi.advanceTimersByTime(1001)
    const result = limiter.check('key')
    expect(result.allowed).toBe(true)
  })

  it('tracks multiple keys independently', () => {
    limiter = new SimpleRateLimiter({ maxRequests: 1, windowMs: 10_000 })
    limiter.check('ip-a')
    expect(limiter.check('ip-a').allowed).toBe(false)
    expect(limiter.check('ip-b').allowed).toBe(true)
  })

  it('reset clears a specific key', () => {
    limiter = new SimpleRateLimiter({ maxRequests: 1, windowMs: 10_000 })
    limiter.check('key')
    expect(limiter.check('key').allowed).toBe(false)
    limiter.reset('key')
    expect(limiter.check('key').allowed).toBe(true)
  })

  it('reset clears all keys when no key provided', () => {
    vi.useFakeTimers()
    limiter = new SimpleRateLimiter({ maxRequests: 1, windowMs: 10_000 })
    limiter.check('ip-a')
    limiter.check('ip-b')
    expect(limiter.size).toBe(2)
    limiter.reset()
    expect(limiter.size).toBe(0)
  })

  it('returns correct remaining count', () => {
    limiter = new SimpleRateLimiter({ maxRequests: 5, windowMs: 10_000 })
    limiter.check('key')
    limiter.check('key')
    const r3 = limiter.check('key')
    expect(r3.remaining).toBe(2)
  })

  it('retryAfterMs reflects time until window expires', () => {
    vi.useFakeTimers()
    limiter = new SimpleRateLimiter({ maxRequests: 2, windowMs: 5000 })
    limiter.check('key')
    vi.advanceTimersByTime(1000)
    limiter.check('key')
    const result = limiter.check('key')
    expect(result.allowed).toBe(false)
    // Window started at 0, ends at 5000; at t=1000, 4000ms remain
    expect(result.retryAfterMs).toBe(4000)
  })

  it('size property reflects store entries', () => {
    vi.useFakeTimers()
    limiter = new SimpleRateLimiter({ maxRequests: 5, windowMs: 1000 })
    limiter.check('ip-a')
    expect(limiter.size).toBe(1)
    limiter.check('ip-b')
    expect(limiter.size).toBe(2)
  })

  it('cleanup removes expired entries', () => {
    vi.useFakeTimers()
    limiter = new SimpleRateLimiter({ maxRequests: 5, windowMs: 1000 })
    limiter.check('key')
    expect(limiter.size).toBe(1)
    vi.advanceTimersByTime(1001)
    limiter.cleanup()
    expect(limiter.size).toBe(0)
  })

  it('cleanup preserves active entries', () => {
    vi.useFakeTimers()
    limiter = new SimpleRateLimiter({ maxRequests: 5, windowMs: 1000 })
    limiter.check('key')
    vi.advanceTimersByTime(500)
    limiter.cleanup()
    expect(limiter.size).toBe(1)
  })

  it('destroy clears store and timer', () => {
    limiter = new SimpleRateLimiter({ maxRequests: 5, windowMs: 10_000 })
    limiter.check('key')
    expect(limiter.size).toBe(1)
    limiter.destroy()
    expect(limiter.size).toBe(0)
  })
})

describe('createRateLimitMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(ip: string, extraHeaders?: Record<string, string>): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': ip, ...extraHeaders },
    })
  }

  it('returns NextResponse.next() when under limit', () => {
    const mw = createRateLimitMiddleware({ maxRequests: 5, windowMs: 10_000 })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(200)
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4')
    mw.limiter.destroy()
  })

  it('returns 429 with Retry-After when limit exceeded', () => {
    const mw = createRateLimitMiddleware({ maxRequests: 1, windowMs: 10_000 })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(429)
    const retryAfter = Number(res.headers.get('Retry-After'))
    expect(retryAfter).toBeGreaterThan(0)
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
    mw.limiter.destroy()
  })

  it('tracks different IPs independently', () => {
    const mw = createRateLimitMiddleware({ maxRequests: 1, windowMs: 10_000 })
    const r1 = mw(makeRequest('1.2.3.4'))
    const r2 = mw(makeRequest('5.6.7.8'))
    expect(r1.status).toBe(200)
    expect(r2.status).toBe(200)
    mw.limiter.destroy()
  })

  it('sets X-RateLimit-* headers on allowed responses', () => {
    const mw = createRateLimitMiddleware({ maxRequests: 5, windowMs: 10_000 })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4')
    mw.limiter.destroy()
  })

  it('omits X-RateLimit-Reset when enableRateLimitHeaders is false', () => {
    const mw = createRateLimitMiddleware({
      maxRequests: 5,
      windowMs: 10_000,
      enableRateLimitHeaders: false,
    })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.headers.has('X-RateLimit-Reset')).toBe(false)
    mw.limiter.destroy()
  })

  it('returns custom message when limit exceeded', async () => {
    const mw = createRateLimitMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      message: 'Custom rate limit message',
    })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(429)
    await expect(res.text()).resolves.toContain('Custom rate limit message')
    mw.limiter.destroy()
  })

  it('allows whitelisted IPs to bypass rate limiting', () => {
    const mw = createRateLimitMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipWhitelist: ['1.2.3.4'],
    })
    // Exhaust limit for whitelisted IP
    mw(makeRequest('1.2.3.4'))
    // Still allowed because whitelisted
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(200)
    mw.limiter.destroy()
  })

  it('whitelist takes precedence over blacklist', () => {
    const mw = createRateLimitMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipWhitelist: ['1.2.3.4'],
      ipBlacklist: ['1.2.3.4'],
    })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).not.toBe(403)
    expect(res.status).not.toBe(429)
    mw.limiter.destroy()
  })

  it('returns 403 for blacklisted IPs', () => {
    const mw = createRateLimitMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      ipBlacklist: ['1.2.3.4'],
    })
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(403)
    mw.limiter.destroy()
  })

  it('allows requests when key resolver returns null', () => {
    const mw = createRateLimitMiddleware({
      maxRequests: 1,
      windowMs: 10_000,
      keyResolver: () => null,
    })
    mw(makeRequest('1.2.3.4'))
    const res = mw(makeRequest('1.2.3.4'))
    expect(res.status).toBe(200)
    mw.limiter.destroy()
  })
})
