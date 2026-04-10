import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  afterEach(() => {
    resetRateLimit()
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    const r1 = checkRateLimit('key', 3, 10_000)
    const r2 = checkRateLimit('key', 3, 10_000)
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r1.retryAfter).toBeUndefined()
    expect(r2.retryAfter).toBeUndefined()
  })

  it('rejects requests over the limit', () => {
    checkRateLimit('key', 2, 10_000)
    checkRateLimit('key', 2, 10_000)
    const r3 = checkRateLimit('key', 2, 10_000)
    expect(r3.allowed).toBe(false)
    expect(r3.retryAfter).toBeGreaterThan(0)
  })

  it('sliding window expires old requests', () => {
    vi.useFakeTimers()
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

  it('returns retryAfter in seconds', () => {
    vi.useFakeTimers()
    checkRateLimit('key', 2, 5000)
    checkRateLimit('key', 2, 5000)
    vi.advanceTimersByTime(1000)
    const result = checkRateLimit('key', 2, 5000)
    expect(result.allowed).toBe(false)
    // 5000 - 1000 = 4000ms = 4 seconds
    expect(result.retryAfter).toBe(4)
  })

  it('retryAfter reflects time until oldest request expires', () => {
    vi.useFakeTimers()
    checkRateLimit('key', 2, 5000)
    vi.advanceTimersByTime(1000)
    checkRateLimit('key', 2, 5000)
    vi.advanceTimersByTime(500)
    const result = checkRateLimit('key', 2, 5000)
    expect(result.allowed).toBe(false)
    // Oldest was at t=0, will expire at t=5000. At t=1500, need to wait 3500ms = 4 seconds (rounded up)
    expect(result.retryAfter).toBe(4)
  })
})

describe('resetRateLimit', () => {
  afterEach(() => {
    resetRateLimit()
    vi.useRealTimers()
  })

  it('clears rate limit for specific key', () => {
    checkRateLimit('key', 1, 10_000)
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(false)

    resetRateLimit('key')
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(true)
  })

  it('clears all rate limits when no key provided', () => {
    checkRateLimit('ip-a', 1, 10_000)
    checkRateLimit('ip-b', 1, 10_000)
    resetRateLimit()
    expect(checkRateLimit('ip-a', 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit('ip-b', 1, 10_000).allowed).toBe(true)
  })
})
