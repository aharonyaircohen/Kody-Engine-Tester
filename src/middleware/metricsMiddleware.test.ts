import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createMetricsMiddleware, type Metrics } from './metricsMiddleware'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createMetricsMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('adds X-Response-Time header to response', () => {
      const { middleware } = createMetricsMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
      expect(response.headers.get('X-Response-Time')).toMatch(/^\d+ms$/)
    })

    it('skips excluded paths', () => {
      const { middleware, getMetrics } = createMetricsMiddleware({
        excludePaths: ['/health', '/favicon.ico'],
      })

      const healthReq = makeRequest('/health')
      const healthResponse = middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(0)
    })

    it('uses default excluded paths when not specified', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      const faviconReq = makeRequest('/favicon.ico')
      const response = middleware(faviconReq)

      expect(response.headers.has('X-Response-Time')).toBe(false)

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(0)
    })

    it('records metrics for each request', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      const req1 = makeRequest('/api/users')
      middleware(req1)

      const req2 = makeRequest('/api/posts')
      middleware(req2)

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(2)
    })

    it('tracks metrics per route', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      const req1 = makeRequest('/api/users')
      middleware(req1)
      middleware(req1)
      middleware(req1)

      const req2 = makeRequest('/api/posts')
      middleware(req2)

      const metrics = getMetrics()
      expect(metrics.routes['/api/users']).toBeDefined()
      expect(metrics.routes['/api/users'].requestCount).toBe(3)
      expect(metrics.routes['/api/posts']).toBeDefined()
      expect(metrics.routes['/api/posts'].requestCount).toBe(1)
    })
  })

  describe('getMetrics', () => {
    it('returns initial empty metrics', () => {
      const { getMetrics } = createMetricsMiddleware()
      const metrics = getMetrics()

      expect(metrics.totalRequests).toBe(0)
      expect(metrics.totalResponseTimeMs).toBe(0)
      expect(metrics.routes).toEqual({})
    })

    it('returns current metrics with all recorded data', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      const req = makeRequest('/api/test')
      middleware(req)

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(1)
      expect(metrics.totalResponseTimeMs).toBeGreaterThanOrEqual(0)
      expect(metrics.routes['/api/test']).toBeDefined()
      expect(metrics.routes['/api/test'].requestCount).toBe(1)
      expect(metrics.routes['/api/test'].statusCodes['200']).toBe(1)
    })

    it('does not return a reference to internal state', () => {
      const { getMetrics } = createMetricsMiddleware()
      const metrics1 = getMetrics()
      const metrics2 = getMetrics()

      expect(metrics1).not.toBe(metrics2)
      expect(metrics1.routes).not.toBe(metrics2.routes)
    })
  })

  describe('resetMetrics', () => {
    it('resets all metrics to initial state', () => {
      const { middleware, getMetrics, resetMetrics } = createMetricsMiddleware()

      const req = makeRequest('/api/test')
      middleware(req)
      middleware(req)

      let metrics = getMetrics()
      expect(metrics.totalRequests).toBe(2)

      resetMetrics()

      metrics = getMetrics()
      expect(metrics.totalRequests).toBe(0)
      expect(metrics.totalResponseTimeMs).toBe(0)
      expect(metrics.routes).toEqual({})
    })

    it('allows recording new metrics after reset', () => {
      const { middleware, getMetrics, resetMetrics } = createMetricsMiddleware()

      middleware(makeRequest('/api/old'))
      resetMetrics()
      middleware(makeRequest('/api/new'))

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(1)
      expect(metrics.routes['/api/new']).toBeDefined()
      expect(metrics.routes['/api/old']).toBeUndefined()
    })
  })

  describe('metrics endpoint', () => {
    it('returns metrics as JSON at the metrics path', () => {
      const { middleware } = createMetricsMiddleware()

      const req = makeRequest('/metrics')
      const response = middleware(req)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
    })

    it('returns full metrics object at /metrics', async () => {
      const { middleware } = createMetricsMiddleware({
        metricsPath: '/metrics',
      })

      // Make some requests first
      middleware(makeRequest('/api/test'))

      const req = makeRequest('/metrics')
      const response = middleware(req)

      const body = await response.json()
      expect(body.totalRequests).toBe(1)
      expect(body.routes['/api/test']).toBeDefined()
    })

    it('uses custom metrics path when configured', () => {
      const { middleware } = createMetricsMiddleware({
        metricsPath: '/custom-metrics',
      })

      const req = makeRequest('/custom-metrics')
      const response = middleware(req)

      expect(response.status).toBe(200)
    })

    it('sets X-Response-Time header on metrics endpoint', () => {
      const { middleware } = createMetricsMiddleware()

      const req = makeRequest('/metrics')
      const response = middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })
  })

  describe('status code tracking', () => {
    it('tracks status codes per route', () => {
      const { middleware, getMetrics } = createMetricsMiddleware({
        excludePaths: [],
      })

      const req1 = makeRequest('/api/success')
      middleware(req1)

      const metrics = getMetrics()
      expect(metrics.routes['/api/success'].statusCodes['200']).toBe(1)
    })
  })

  describe('response time tracking', () => {
    it('tracks total response time across all requests', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      middleware(makeRequest('/api/test1'))
      middleware(makeRequest('/api/test2'))

      const metrics = getMetrics()
      expect(metrics.totalResponseTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('tracks response time per route', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      middleware(makeRequest('/api/slow'))

      const metrics = getMetrics()
      expect(metrics.routes['/api/slow'].totalResponseTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('configuration options', () => {
    it('accepts custom excludePaths', () => {
      const { middleware, getMetrics } = createMetricsMiddleware({
        excludePaths: ['/api/private', '/api/secret'],
      })

      const req1 = makeRequest('/api/private')
      middleware(req1)
      expect(getMetrics().totalRequests).toBe(0)

      const req2 = makeRequest('/api/public')
      middleware(req2)
      expect(getMetrics().totalRequests).toBe(1)
    })

    it('handles empty excludePaths', () => {
      const { middleware, getMetrics } = createMetricsMiddleware({
        excludePaths: [],
      })

      const req = makeRequest('/any/path')
      middleware(req)
      expect(getMetrics().totalRequests).toBe(1)
    })

    it('uses default metricsPath when not specified', () => {
      const { middleware } = createMetricsMiddleware()

      const req = makeRequest('/metrics')
      const response = middleware(req)

      expect(response.status).toBe(200)
    })

    it('handles multiple custom excludePaths', () => {
      const { middleware, getMetrics } = createMetricsMiddleware({
        excludePaths: ['/health', '/ready', '/live'],
      })

      middleware(makeRequest('/health'))
      middleware(makeRequest('/ready'))
      middleware(makeRequest('/live'))
      middleware(makeRequest('/api/test'))

      expect(getMetrics().totalRequests).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles requests to root path', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      const req = makeRequest('/')
      middleware(req)

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(1)
      expect(metrics.routes['/']).toBeDefined()
    })

    it('handles requests with query strings', () => {
      const req = new NextRequest('http://localhost/api/test?foo=bar')
      const { middleware, getMetrics } = createMetricsMiddleware()

      middleware(req)

      const metrics = getMetrics()
      // Path should not include query string
      expect(metrics.routes['/api/test']).toBeDefined()
    })

    it('handles deeply nested paths', () => {
      const { middleware, getMetrics } = createMetricsMiddleware()

      const req = makeRequest('/api/v1/users/123/profile/settings')
      middleware(req)

      const metrics = getMetrics()
      expect(metrics.routes['/api/v1/users/123/profile/settings']).toBeDefined()
    })

    it('handles metrics being retrieved multiple times', () => {
      const { getMetrics } = createMetricsMiddleware()

      const metrics1 = getMetrics()
      const metrics2 = getMetrics()
      const metrics3 = getMetrics()

      expect(metrics1).toEqual(metrics2)
      expect(metrics2).toEqual(metrics3)
    })

    it('handles reset being called multiple times', () => {
      const { resetMetrics, getMetrics } = createMetricsMiddleware()

      resetMetrics()
      resetMetrics()
      resetMetrics()

      const metrics = getMetrics()
      expect(metrics.totalRequests).toBe(0)
      expect(metrics.routes).toEqual({})
    })
  })
})

describe('Metrics type exports', () => {
  it('exports Metrics interface', () => {
    const metrics: Metrics = {
      totalRequests: 0,
      totalResponseTimeMs: 0,
      routes: {},
    }
    expect(metrics.totalRequests).toBe(0)
  })
})
