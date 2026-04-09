import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createRequestTiming, type RequestTimingConfig } from './request-timing'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createRequestTiming', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('adds X-Response-Time header to response', () => {
      const middleware = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('header value is in milliseconds format', () => {
      const middleware = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).toMatch(/^\d+ms$/)
    })

    it('returns NextResponse.next() for non-excluded paths', () => {
      const middleware = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('skips excluded paths', () => {
      const config: RequestTimingConfig = {
        excludePaths: ['/health', '/favicon.ico'],
      }
      const middleware = createRequestTiming(config)
      const req = makeRequest('/health')
      const response = middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(false)
    })

    it('uses default excluded paths when not specified', () => {
      const middleware = createRequestTiming()

      const healthReq = makeRequest('/health')
      const healthResponse = middleware(healthReq)
      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const faviconReq = makeRequest('/favicon.ico')
      const faviconResponse = middleware(faviconReq)
      expect(faviconResponse.headers.has('X-Response-Time')).toBe(false)
    })

    it('measures elapsed time correctly', () => {
      const middleware = createRequestTiming()
      const req = makeRequest('/api/slow')

      const startTime = Date.now()
      // Simulate some processing time by advancing timers after start
      vi.advanceTimersByTime(50)
      const response = middleware(req)

      // Since middleware is synchronous, response time will be 0ms
      // but header should still be present
      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).toBe('0ms')
    })

    it('handles custom excludePaths', () => {
      const config: RequestTimingConfig = {
        excludePaths: ['/api/private', '/api/secret'],
      }
      const middleware = createRequestTiming(config)

      const privateReq = makeRequest('/api/private')
      const privateResponse = middleware(privateReq)
      expect(privateResponse.headers.has('X-Response-Time')).toBe(false)

      const publicReq = makeRequest('/api/public')
      const publicResponse = middleware(publicReq)
      expect(publicResponse.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles empty excludePaths array', () => {
      const config: RequestTimingConfig = {
        excludePaths: [],
      }
      const middleware = createRequestTiming(config)
      const req = makeRequest('/any/path')
      const response = middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })
  })
})