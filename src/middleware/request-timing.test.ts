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
    it('adds X-Response-Time header to response', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('header contains numeric value and ms suffix', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).toMatch(/^\d+ms$/)
    })

    it('measures elapsed time between request and response', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      // Response time should be a positive number or 0 (synchronous execution)
      expect(headerValue).toMatch(/^\d+ms$/)
      // Verify it's parseable as a number
      const numericValue = parseInt(headerValue!, 10)
      expect(numericValue).toBeGreaterThanOrEqual(0)
    })

    it('skips excluded paths', () => {
      const config: RequestTimingConfig = { excludedPaths: ['/health', '/favicon.ico'] }
      const timing = createRequestTiming(config)

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)
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

    it('applies custom excluded paths', () => {
      const config: RequestTimingConfig = { excludedPaths: ['/api/private', '/api/secret'] }
      const timing = createRequestTiming(config)

      const privateReq = makeRequest('/api/private')
      const privateResponse = timing.middleware(privateReq)
      expect(privateResponse.headers.has('X-Response-Time')).toBe(false)

      const publicReq = makeRequest('/api/public')
      const publicResponse = timing.middleware(publicReq)
      expect(publicResponse.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles empty excluded paths', () => {
      const config: RequestTimingConfig = { excludedPaths: [] }
      const timing = createRequestTiming(config)

      const req = makeRequest('/any/path')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('returns NextResponse with correct status', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.status).toBe(200)
    })

    it('works with various path patterns', () => {
      const timing = createRequestTiming()

      const paths = ['/', '/api', '/api/users/123', '/api/v1/users']

      for (const path of paths) {
        const req = makeRequest(path)
        const response = timing.middleware(req)
        expect(response.headers.has('X-Response-Time')).toBe(true)
      }
    })
  })
})