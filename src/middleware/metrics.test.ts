import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createMetricsMiddleware, normalizeRoutePath, calculatePercentiles } from './metrics'

describe('normalizeRoutePath', () => {
  it('normalizes numeric path segments to :id', () => {
    expect(normalizeRoutePath('/api/users/123')).toBe('/api/users/:id')
    expect(normalizeRoutePath('/api/users/456')).toBe('/api/users/:id')
    expect(normalizeRoutePath('/api/courses/1')).toBe('/api/courses/:id')
  })

  it('normalizes UUID path segments to :id', () => {
    expect(normalizeRoutePath('/api/users/550e8400-e29b-41d4-a716-446655440000')).toBe(
      '/api/users/:id'
    )
    expect(
      normalizeRoutePath('/api/enrollments/550e8400-e29b-41d4-a716-446655440001')
    ).toBe('/api/enrollments/:id')
  })

  it('normalizes multiple dynamic segments', () => {
    expect(normalizeRoutePath('/api/courses/1/lessons/2')).toBe(
      '/api/courses/:id/lessons/:id'
    )
  })

  it('keeps static paths unchanged', () => {
    expect(normalizeRoutePath('/api/health')).toBe('/api/health')
    expect(normalizeRoutePath('/api/users')).toBe('/api/users')
  })

  it('normalizes mixed static and dynamic segments', () => {
    expect(normalizeRoutePath('/api/users/123/profile')).toBe('/api/users/:id/profile')
  })
})

describe('calculatePercentiles', () => {
  it('returns zeros for empty array', () => {
    expect(calculatePercentiles([])).toEqual({ p50: 0, p95: 0, p99: 0 })
  })

  it('calculates p50 correctly', () => {
    expect(calculatePercentiles([1, 2, 3, 4, 5])).toEqual({ p50: 3, p95: 5, p99: 5 })
  })

  it('calculates p50 for single element', () => {
    expect(calculatePercentiles([10])).toEqual({ p50: 10, p95: 10, p99: 10 })
  })

  it('calculates percentiles for many values', () => {
    // Generate 100 values from 1 to 100
    const values = Array.from({ length: 100 }, (_, i) => i + 1)
    const result = calculatePercentiles(values)
    // p50 should be around 50
    expect(result.p50).toBeGreaterThan(0)
    expect(result.p95).toBeGreaterThan(result.p50)
    expect(result.p99).toBeGreaterThan(result.p95)
  })

  it('handles unsorted input', () => {
    // Should sort internally
    expect(calculatePercentiles([5, 2, 8, 1, 9])).toEqual({ p50: 5, p95: 9, p99: 9 })
  })
})

describe('createMetricsMiddleware', () => {
  let metrics: ReturnType<typeof createMetricsMiddleware>

  afterEach(() => {
    metrics?.reset()
    vi.useRealTimers()
  })

  describe('request tracking', () => {
    it('tracks request count by method and route pattern', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/users/123', 'GET'))
      middleware(makeRequest('/api/users/456', 'GET'))
      middleware(makeRequest('/api/users/123', 'POST'))

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/users/:id']?.count).toBe(2)
      expect(m.routes['POST:/api/users/:id']?.count).toBe(1)
    })

    it('does not block the response', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      const response = middleware(makeRequest('/api/test', 'GET'))
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200) // NextResponse.next() returns 200
    })

    it('tracks requests for multiple routes independently', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/a/1', 'GET'))
      middleware(makeRequest('/api/b/2', 'GET'))
      middleware(makeRequest('/api/b/3', 'GET'))

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/a/:id']?.count).toBe(1)
      expect(m.routes['GET:/api/b/:id']?.count).toBe(2)
    })
  })

  describe('route normalization', () => {
    it('normalizes numeric path segments', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/users/123', 'GET'))
      middleware(makeRequest('/api/users/456', 'GET'))
      middleware(makeRequest('/api/users/789', 'GET'))

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/users/:id']).toBeDefined()
      expect(m.routes['GET:/api/users/:id']?.count).toBe(3)
    })

    it('normalizes UUID path segments', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(
        makeRequest('/api/users/550e8400-e29b-41d4-a716-446655440000', 'GET')
      )

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/users/:id']).toBeDefined()
    })

    it('normalizes multiple dynamic segments', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/courses/1/lessons/2', 'GET'))

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/courses/:id/lessons/:id']).toBeDefined()
    })

    it('keeps static paths unchanged', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/health', 'GET'))

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/health']).toBeDefined()
      expect(m.routes['GET:/api/health']?.count).toBe(1)
    })
  })

  describe('percentile calculation', () => {
    it('calculates percentiles for tracked latencies', () => {
      metrics = createMetricsMiddleware({ maxLatencySamples: 1000 })
      const middleware = metrics.middleware

      // Make several requests - the middleware tracks latency internally
      for (let i = 0; i < 10; i++) {
        middleware(makeRequest('/api/test', 'GET'))
      }

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/test']?.percentiles).toBeDefined()
      expect(m.routes['GET:/api/test']?.percentiles.p50).toBeGreaterThanOrEqual(0)
    })
  })

  describe('memory cleanup', () => {
    it('removes stale entries after TTL', () => {
      vi.useFakeTimers()
      metrics = createMetricsMiddleware({ entryTtlMs: 1000, cleanupIntervalMs: 500 })
      const middleware = metrics.middleware

      vi.setSystemTime(1000)
      middleware(makeRequest('/api/old', 'GET'))

      vi.setSystemTime(3000) // Well past TTL (1000ms TTL from t=1000)
      metrics.cleanup()

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/old']).toBeUndefined()
    })

    it('does not remove fresh entries during cleanup', () => {
      vi.useFakeTimers()
      metrics = createMetricsMiddleware({ entryTtlMs: 5000, cleanupIntervalMs: 1000 })
      const middleware = metrics.middleware

      vi.setSystemTime(1000)
      middleware(makeRequest('/api/test', 'GET'))

      vi.setSystemTime(2000)
      metrics.cleanup() // Only 1 second old, well within TTL

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/test']).toBeDefined()
      expect(m.routes['GET:/api/test']?.count).toBe(1)
    })

    it('periodic cleanup timer is created', () => {
      vi.useFakeTimers()
      metrics = createMetricsMiddleware({ cleanupIntervalMs: 1000 })

      // Timer should be created - verify by checking cleanup runs
      vi.setSystemTime(1000)
      middleware(makeRequest('/api/test', 'GET'))

      vi.setSystemTime(2000)
      metrics.cleanup()

      const m = metrics.getMetrics()
      expect(m.routes['GET:/api/test']).toBeDefined()
    })

    function middleware(request: NextRequest): NextResponse {
      return metrics.middleware(request)
    }
  })

  describe('reset', () => {
    it('clears all metrics when reset is called', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/test', 'GET'))
      middleware(makeRequest('/api/test2', 'POST'))

      expect(metrics.getMetrics().totals.requestCount).toBe(2)

      metrics.reset()

      const m = metrics.getMetrics()
      expect(m.totals.requestCount).toBe(0)
      expect(Object.keys(m.routes).length).toBe(0)
    })
  })

  describe('getMetrics serialization', () => {
    it('returns properly structured metrics object', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/test', 'GET'))

      const m = metrics.getMetrics()

      expect(m).toHaveProperty('totals')
      expect(m.totals).toHaveProperty('requestCount')
      expect(m.totals).toHaveProperty('avgLatencyMs')
      expect(m.totals).toHaveProperty('errorCount4xx')
      expect(m.totals).toHaveProperty('errorCount5xx')

      expect(m).toHaveProperty('routes')
      expect(m).toHaveProperty('generatedAt')
    })

    it('includes percentiles in route metrics', () => {
      metrics = createMetricsMiddleware()
      const middleware = metrics.middleware

      middleware(makeRequest('/api/test', 'GET'))

      const m = metrics.getMetrics()
      const route = m.routes['GET:/api/test']

      expect(route).toBeDefined()
      expect(route).toHaveProperty('percentiles')
      expect(route?.percentiles).toHaveProperty('p50')
      expect(route?.percentiles).toHaveProperty('p95')
      expect(route?.percentiles).toHaveProperty('p99')
    })
  })
})

function makeRequest(path: string, method: string = 'GET'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
  })
}