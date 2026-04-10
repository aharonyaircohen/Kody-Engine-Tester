import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createRequestTiming, type RequestTimingConfig } from './request-timing'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createRequestTiming', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('adds X-Response-Time header with duration in milliseconds', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')

      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
      expect(response.headers.get('X-Response-Time')).toBe('0')
    })

    it('measures elapsed time for request', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')

      const response = timing.middleware(req)

      const responseTime = parseInt(response.headers.get('X-Response-Time') ?? '0', 10)
      expect(responseTime).toBeGreaterThanOrEqual(0)
    })

    it('skips excluded paths', () => {
      const config: RequestTimingConfig = {
        excludePaths: ['/health', '/favicon.ico'],
      }
      const timing = createRequestTiming(config)

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const faviconReq = makeRequest('/favicon.ico')
      const faviconResponse = timing.middleware(faviconReq)

      expect(faviconResponse.headers.has('X-Response-Time')).toBe(false)
    })

    it('uses default excluded paths when not specified', () => {
      const timing = createRequestTiming()

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const faviconReq = makeRequest('/favicon.ico')
      const faviconResponse = timing.middleware(faviconReq)

      expect(faviconResponse.headers.has('X-Response-Time')).toBe(false)
    })

    it('allows custom excludePaths', () => {
      const config: RequestTimingConfig = {
        excludePaths: ['/api/private', '/api/secret'],
      }
      const timing = createRequestTiming(config)

      const privateReq = makeRequest('/api/private')
      const privateResponse = timing.middleware(privateReq)
      expect(privateResponse.headers.has('X-Response-Time')).toBe(false)

      const publicReq = makeRequest('/api/public')
      const publicResponse = timing.middleware(publicReq)
      expect(publicResponse.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles empty excludePaths', () => {
      const config: RequestTimingConfig = {
        excludePaths: [],
      }
      const timing = createRequestTiming(config)

      const req = makeRequest('/any/path')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('returns NextResponse.next() for non-excluded paths', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/users')

      const response = timing.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('returns NextResponse.next() for excluded paths', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/health')

      const response = timing.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('handles requests with query parameters', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/search?q=test&page=1')

      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })
  })
})
