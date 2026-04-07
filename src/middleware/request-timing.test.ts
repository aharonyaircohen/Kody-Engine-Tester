import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createRequestTiming } from './request-timing'

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

    it('returns NextResponse with headers preserved', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('sets X-Response-Time header with numeric value', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).not.toBeNull()
      expect(Number(headerValue)).toBeGreaterThanOrEqual(0)
    })

    it('handles fast requests with minimal elapsed time', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      const elapsed = Number(headerValue)
      // Fast synchronous request should have minimal elapsed time
      expect(elapsed).toBeLessThan(100)
    })
  })
})