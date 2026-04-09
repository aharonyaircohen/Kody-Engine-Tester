import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimit } from './rate-limiter-utils'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
    vi.useFakeTimers()
  });

  it('allows requests under the limit', () => {
    const result = checkRateLimit('ip-1', 3, 1000)
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  });

  it('rejects requests over the limit', () => {
    checkRateLimit('ip-1', 2, 1000)
    checkRateLimit('ip-1', 2, 1000)
    const result = checkRateLimit('ip-1', 2, 1000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  });

  it('resets count after window expiry', () => {
    checkRateLimit('ip-1', 2, 1000)
    checkRateLimit('ip-1', 2, 1000)
    // Advance time past the window
    vi.advanceTimersByTime(1001)
    const result = checkRateLimit('ip-1', 2, 1000)
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  });

  it('tracks independent keys separately', () => {
    checkRateLimit('ip-1', 1, 1000)
    const result = checkRateLimit('ip-2', 1, 1000)
    expect(result.allowed).toBe(true)
  });

  it('calculates correct retryAfter', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z').getTime())
    checkRateLimit('ip-1', 1, 1000)
    vi.setSystemTime(new Date('2026-01-01T00:00:00.500Z').getTime())
    const result = checkRateLimit('ip-1', 1, 1000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(1) // ~500ms remaining, ceil to 1 second
  });
})
