import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createRequestTimingMiddleware, type RequestTimingConfig } from './request-timing'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createRequestTimingMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('adds X-Response-Time header to response', () => {
      const timing = createRequestTimingMiddleware()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('header contains elapsed time in milliseconds', () => {
      const timing = createRequestTimingMiddleware()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).toMatch(/^\d+\.\d{2}ms$/)
    })

    it('returns NextResponse.next() for non-excluded paths', () => {
      const timing = createRequestTimingMiddleware()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('skips excluded paths without adding header', () => {
      const timing = createRequestTimingMiddleware({
        excludedPaths: ['/health', '/favicon.ico'],
      })

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)
    })

    it('uses default excluded paths when not specified', () => {
      const timing = createRequestTimingMiddleware()

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)
      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const faviconReq = makeRequest('/favicon.ico')
      const faviconResponse = timing.middleware(faviconReq)
      expect(faviconResponse.headers.has('X-Response-Time')).toBe(false)
    })

    it('respects custom header name configuration', () => {
      const timing = createRequestTimingMiddleware({
        headerName: 'X-Custom-Timing',
      })

      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Custom-Timing')).toBe(true)
      expect(response.headers.has('X-Response-Time')).toBe(false)
    })

    it('respects custom excluded paths', () => {
      const timing = createRequestTimingMiddleware({
        excludedPaths: ['/api/private', '/api/secret'],
      })

      const privateReq = makeRequest('/api/private')
      const privateResponse = timing.middleware(privateReq)
      expect(privateResponse.headers.has('X-Response-Time')).toBe(false)

      const publicReq = makeRequest('/api/public')
      const publicResponse = timing.middleware(publicReq)
      expect(publicResponse.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles empty excluded paths', () => {
      const timing = createRequestTimingMiddleware({
        excludedPaths: [],
      })

      const req = makeRequest('/any/path')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })
  })

  describe('configuration options', () => {
    it('accepts all config options together', () => {
      const config: RequestTimingConfig = {
        excludedPaths: ['/skip'],
        headerName: 'X-Request-Duration',
        precision: 3,
      }

      const timing = createRequestTimingMiddleware(config)
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Request-Duration')).toBe(true)
      expect(response.headers.get('X-Request-Duration')).toMatch(/^\d+\.\d{3}ms$/)
    })
  })
})
