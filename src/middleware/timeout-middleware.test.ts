import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createTimeoutMiddleware, getDefaultTimeout } from './timeout-middleware'

function makeRequest(path: string, requestId?: string): NextRequest {
  const req = new NextRequest(`http://localhost${path}`, {
    headers: {
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
  })
  return req
}

describe('getDefaultTimeout', () => {
  it('returns 30000ms (30 seconds)', () => {
    expect(getDefaultTimeout()).toBe(30_000)
  })
})

describe('createTimeoutMiddleware', () => {
  let middleware: ReturnType<typeof createTimeoutMiddleware>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    middleware?.clearStore?.()
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('allows requests under the timeout threshold', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 30_000 })
      const req = makeRequest('/api/test')
      const response = middleware(req)
      expect(response.status).toBe(200)
      expect(response.headers.has('X-Request-Timeout')).toBe(false)
    })

    it('adds X-Request-Id header to response', () => {
      middleware = createTimeoutMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)
      expect(response.headers.has('X-Request-Id')).toBe(true)
    })

    it('returns 504 with X-Request-Timeout header when timeout is exceeded', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 30_000 })
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)

      // First call sets start time
      middleware(req)

      // Advance time beyond the timeout
      vi.advanceTimersByTime(30_001)

      // Second call with same requestId should detect timeout
      const response = middleware(req)
      expect(response.status).toBe(504)
      expect(response.headers.get('X-Request-Timeout')).toBe('true')
    })

    it('uses default timeout of 30 seconds when not specified', () => {
      middleware = createTimeoutMiddleware()
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)

      // First call sets start time
      middleware(req)

      // Advance time just under 30 seconds - should still pass
      vi.advanceTimersByTime(29_999)
      let response = middleware(req)
      expect(response.status).toBe(200)

      // Advance past 30 seconds total
      vi.advanceTimersByTime(2) // 30001ms total
      response = middleware(req)
      expect(response.status).toBe(504)
    })

    it('skips excluded paths', () => {
      middleware = createTimeoutMiddleware({
        timeoutMs: 1,
        excludePaths: ['/health', '/favicon.ico'],
      })
      const healthReq = makeRequest('/health')
      const response = middleware(healthReq)
      expect(response.status).toBe(200)
      expect(response.headers.has('X-Request-Timeout')).toBe(false)
    })

    it('skips default excluded paths (/health, /favicon.ico)', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 1 })
      const healthReq = makeRequest('/health')
      const response = middleware(healthReq)
      expect(response.status).toBe(200)
    })

    it('preserves existing x-request-id header', () => {
      middleware = createTimeoutMiddleware()
      const req = makeRequest('/api/test', 'existing-request-id')
      const response = middleware(req)
      expect(response.headers.get('X-Request-Id')).toBe('existing-request-id')
    })
  })

  describe('checkTimeout', () => {
    it('returns timedOut: false for fresh requests', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 30_000 })
      const req = makeRequest('/api/test')
      const result = middleware.checkTimeout(req)
      expect(result.timedOut).toBe(false)
      expect(result.elapsedMs).toBe(0)
    })

    it('returns timedOut: true when elapsed time exceeds timeout', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 5000 })
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)

      // First call to set start time
      middleware(req)

      // Advance time beyond timeout
      vi.advanceTimersByTime(5001)

      const result = middleware.checkTimeout(req)
      expect(result.timedOut).toBe(true)
      expect(result.elapsedMs).toBeGreaterThan(5000)
    })

    it('returns timedOut: false when elapsed time is within timeout', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 10_000 })
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)

      // First call to set start time
      middleware(req)

      // Advance time but still within timeout
      vi.advanceTimersByTime(5000)

      const result = middleware.checkTimeout(req)
      expect(result.timedOut).toBe(false)
      expect(result.elapsedMs).toBe(5000)
    })
  })

  describe('custom timeout configuration', () => {
    it('accepts custom timeout in milliseconds', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 5000 })
      expect(middleware.timeoutMs).toBe(5000)
    })

    it('uses default 30 second timeout when not specified', () => {
      middleware = createTimeoutMiddleware()
      expect(middleware.timeoutMs).toBe(30_000)
    })

    it('handles very short timeouts', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 1 })
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)
      const response = middleware(req)
      expect(response.status).toBe(200)

      // Second call with time advanced beyond timeout
      vi.advanceTimersByTime(2)
      const response2 = middleware(req)
      expect(response2.status).toBe(504)
    })
  })

  describe('custom excludePaths', () => {
    it('accepts custom excludePaths array', () => {
      middleware = createTimeoutMiddleware({
        timeoutMs: 1,
        excludePaths: ['/api/private', '/api/secret'],
      })
      const privateReq = makeRequest('/api/private')
      const response = middleware(privateReq)
      expect(response.status).toBe(200)
      expect(response.headers.has('X-Request-Timeout')).toBe(false)
    })

    it('handles empty excludePaths', () => {
      middleware = createTimeoutMiddleware({
        timeoutMs: 1,
        excludePaths: [],
      })
      const req = makeRequest('/health')
      const response = middleware(req)
      // /health is not excluded when excludePaths is empty array
      expect(response.status).toBe(200)
    })
  })

  describe('clearStore', () => {
    it('clears all tracked request start times', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 1000 })
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)

      // Set start time
      middleware(req)

      // Clear the store
      middleware.clearStore()

      // Now checkTimeout should return timedOut: false (no start time found)
      vi.advanceTimersByTime(2000)
      const result = middleware.checkTimeout(req)
      expect(result.timedOut).toBe(false)
      expect(result.elapsedMs).toBe(0)
    })
  })

  describe('timeout response body', () => {
    it('returns JSON error body on timeout', () => {
      middleware = createTimeoutMiddleware({ timeoutMs: 1000 })
      const requestId = 'test-request-id'
      const req = makeRequest('/api/test', requestId)

      middleware(req)
      vi.advanceTimersByTime(1001)

      const response = middleware(req)
      expect(response.status).toBe(504)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })
  })
})

describe('multiple concurrent requests', () => {
  let middleware: ReturnType<typeof createTimeoutMiddleware>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    middleware?.clearStore?.()
    vi.useRealTimers()
  })

  it('tracks different request IDs independently', () => {
    middleware = createTimeoutMiddleware({ timeoutMs: 5000 })

    const req1 = makeRequest('/api/test', 'request-1')
    const req2 = makeRequest('/api/test', 'request-2')

    // Start req1
    middleware(req1)

    // Advance time for req1
    vi.advanceTimersByTime(3000)

    // Start req2 (it will have a different start time)
    middleware(req2)

    // Advance time more - now req1 has been waiting 6000ms (timeout) and req2 has been waiting 3000ms (not timeout)
    vi.advanceTimersByTime(3000)

    // req1 should timeout
    const response1 = middleware(req1)
    expect(response1.status).toBe(504)

    // req2 should still be fine (only 3000ms elapsed)
    const response2 = middleware(req2)
    expect(response2.status).toBe(200)
  })

  it('cleans up start time after timeout response', () => {
    middleware = createTimeoutMiddleware({ timeoutMs: 1000 })
    const requestId = 'test-request-id'
    const req = makeRequest('/api/test', requestId)

    // First call sets start time
    middleware(req)

    // Advance past timeout
    vi.advanceTimersByTime(1001)

    // Should timeout and clean up
    const response = middleware(req)
    expect(response.status).toBe(504)

    // After cleanup, next call should start fresh
    vi.advanceTimersByTime(500)
    const response2 = middleware(req)
    expect(response2.status).toBe(200)
  })
})