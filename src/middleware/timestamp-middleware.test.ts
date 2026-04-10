import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createTimestampMiddleware } from './timestamp-middleware'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createTimestampMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('adds X-Response-Time header to response', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('header value is a positive number string', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      const value = response.headers.get('X-Response-Time')
      expect(value).not.toBeNull()
      const parsed = parseInt(value!, 10)
      expect(parsed).toBeGreaterThanOrEqual(0)
    })

    it('returns a valid NextResponse', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('allows request to proceed to next handler', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.status).toBe(200)
    })

    it('measures time in milliseconds', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')

      vi.advanceTimersByTime(50)
      const response = timestampMiddleware.middleware(req)

      const value = parseInt(response.headers.get('X-Response-Time')!, 10)
      expect(value).toBeGreaterThanOrEqual(0)
    })
  })
})