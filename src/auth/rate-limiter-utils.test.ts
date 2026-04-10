import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
    vi.useFakeTimers()
  })

  afterEach(() => {
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

  it('fixed window expires after windowMs', () => {
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

  it('retryAfter reflects time until window expires', () => {
    vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))
    checkRateLimit('key', 2, 5000)
    checkRateLimit('key', 2, 5000)
    vi.advanceTimersByTime(1000)
    const result = checkRateLimit('key', 2, 5000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(4000)
  })

  it('new window resets count correctly', () => {
    vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))
    checkRateLimit('key', 2, 1000)
    checkRateLimit('key', 2, 1000)

    vi.advanceTimersByTime(1001)
    vi.setSystemTime(new Date('2026-04-10T12:00:01.001Z'))

    const r1 = checkRateLimit('key', 2, 1000)
    const r2 = checkRateLimit('key', 2, 1000)
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
  })
})

describe('resetRateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resets specific key', () => {
    vi.useFakeTimers()
    checkRateLimit('key', 1, 10_000)
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(false)

    resetRateLimit('key')
    expect(checkRateLimit('key', 1, 10_000).allowed).toBe(true)
  })

  it('resets all keys when no key provided', () => {
    vi.useFakeTimers()
    checkRateLimit('ip-a', 1, 10_000)
    checkRateLimit('ip-b', 1, 10_000)

    resetRateLimit()

    expect(checkRateLimit('ip-a', 1, 10_000).allowed).toBe(true)
    expect(checkRateLimit('ip-b', 1, 10_000).allowed).toBe(true)
  })
})
