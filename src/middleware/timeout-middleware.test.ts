import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createTimeoutMiddleware } from './timeout-middleware'

describe('createTimeoutMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(): NextRequest {
    return new NextRequest('http://localhost/api/test')
  }

  it('returns NextResponse.next() when request is within timeout', () => {
    const mw = createTimeoutMiddleware({ timeoutMs: 1000 })
    const res = mw(makeRequest())
    expect(res.status).toBe(200)
  })

  it('returns 504 Gateway Timeout when request exceeds timeout', () => {
    vi.useFakeTimers()
    const mw = createTimeoutMiddleware({ timeoutMs: 100 })
    const start = Date.now()

    // Simulate a slow request that exceeds timeout
    vi.advanceTimersByTime(101)

    const res = mw(makeRequest())
    expect(res.status).toBe(504)
    expect(res.headers.get('Content-Type')).toBe('application/json')
  })

  it('returns 504 when timeout occurs mid-request', () => {
    vi.useFakeTimers()
    const mw = createTimeoutMiddleware({ timeoutMs: 50 })

    // Advance past timeout
    vi.advanceTimersByTime(51)

    const res = mw(makeRequest())
    expect(res.status).toBe(504)
  })

  it('allows requests that complete before timeout', () => {
    vi.useFakeTimers()
    const mw = createTimeoutMiddleware({ timeoutMs: 500 })

    // Advance time but not past timeout
    vi.advanceTimersByTime(400)

    const res = mw(makeRequest())
    expect(res.status).toBe(200)
  })

  it('timeout is measured from middleware creation', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    // Create middleware at time 0
    const mw = createTimeoutMiddleware({ timeoutMs: 100 })

    // Advance to time 99 - still within timeout
    vi.advanceTimersByTime(99)
    expect(mw(makeRequest()).status).toBe(200)

    // Advance to time 101 - past timeout
    vi.advanceTimersByTime(2)
    expect(mw(makeRequest()).status).toBe(504)
  })

  it('returns 504 with proper JSON error body', async () => {
    vi.useFakeTimers()
    const mw = createTimeoutMiddleware({ timeoutMs: 10 })
    vi.advanceTimersByTime(11)

    const res = mw(makeRequest())
    expect(res.status).toBe(504)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((await res.json()).error).toBe('Gateway Timeout')
  })

  it('handles zero timeout immediately', () => {
    vi.useFakeTimers()
    const mw = createTimeoutMiddleware({ timeoutMs: 0 })
    const res = mw(makeRequest())
    expect(res.status).toBe(504)
  })

  it('handles very small timeout', () => {
    vi.useFakeTimers()
    const mw = createTimeoutMiddleware({ timeoutMs: 1 })
    vi.advanceTimersByTime(1)
    const res = mw(makeRequest())
    expect(res.status).toBe(504)
  })
})