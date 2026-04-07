import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createRequestTimingMiddleware } from './request-timing'

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
      expect(response.headers.get('X-Response-Time')).toMatch(/^\d+ms$/)
    })

    it('skips excluded paths', () => {
      const timing = createRequestTimingMiddleware({
        excludePaths: ['/health', '/favicon.ico'],
      })

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)
    })

    it('skips default excluded paths (/health, /favicon.ico)', () => {
      const timing = createRequestTimingMiddleware()

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const faviconReq = makeRequest('/favicon.ico')
      const faviconResponse = timing.middleware(faviconReq)

      expect(faviconResponse.headers.has('X-Response-Time')).toBe(false)
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

    it('handles empty excludePaths', () => {
      const timing = createRequestTimingMiddleware({
        excludePaths: [],
      })

      const req = makeRequest('/any/path')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('returns NextResponse.next() for non-excluded paths', () => {
      const timing = createRequestTimingMiddleware()
      const req = makeRequest('/api/users')
      const response = timing.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })
  })

  describe('configuration options', () => {
    it('accepts custom excludePaths', () => {
      const timing = createRequestTimingMiddleware({
        excludePaths: ['/api/private', '/api/secret'],
      })

      const privateReq = makeRequest('/api/private')
      const privateResponse = timing.middleware(privateReq)
      expect(privateResponse.headers.has('X-Response-Time')).toBe(false)

      const publicReq = makeRequest('/api/public')
      const publicResponse = timing.middleware(publicReq)
      expect(publicResponse.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles custom excludePaths with overlapping defaults', () => {
      const timing = createRequestTimingMiddleware({
        excludePaths: ['/health', '/api/custom'],
      })

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)
      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)

      const customReq = makeRequest('/api/custom')
      const customResponse = timing.middleware(customReq)
      expect(customResponse.headers.has('X-Response-Time')).toBe(false)
    })
  })
})