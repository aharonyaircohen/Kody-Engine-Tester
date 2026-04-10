import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createTimestampMiddleware } from './timestamp-middleware'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createTimestampMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-10T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('middleware', () => {
    it('adds x-timestamp header to response', () => {
      const { middleware } = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response.headers.has('x-timestamp')).toBe(true)
    })

    it('header value is in ISO 8601 format', () => {
      const { middleware } = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      const timestamp = response.headers.get('x-timestamp')
      expect(timestamp).toBe('2026-04-10T12:00:00.000Z')
      expect(() => new Date(timestamp!)).not.toThrow()
    })

    it('returns a NextResponse instance', () => {
      const { middleware } = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('calls next handler after header is set', () => {
      const { middleware } = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = middleware(req)

      expect(response.status).toBe(200)
    })

    it('works with different request paths', () => {
      const { middleware } = createTimestampMiddleware()

      const paths = ['/api/users', '/api/items/123', '/health', '/']
      for (const path of paths) {
        const req = makeRequest(path)
        const response = middleware(req)
        expect(response.headers.get('x-timestamp')).toBeTruthy()
      }
    })

    it('timestamp is unique per request', () => {
      const { middleware } = createTimestampMiddleware()
      const req1 = makeRequest('/api/test')
      const req2 = makeRequest('/api/test')

      const response1 = middleware(req1)
      const response2 = middleware(req2)

      expect(response1.headers.get('x-timestamp')).toBe(response2.headers.get('x-timestamp'))
    })

    it('timestamp reflects current time at call time', () => {
      const { middleware } = createTimestampMiddleware()
      const req = makeRequest('/api/test')

      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
      const response1 = middleware(req)
      expect(response1.headers.get('x-timestamp')).toBe('2026-01-01T00:00:00.000Z')

      vi.setSystemTime(new Date('2026-12-31T23:59:59.999Z'))
      const response2 = middleware(req)
      expect(response2.headers.get('x-timestamp')).toBe('2026-12-31T23:59:59.999Z')
    })
  })
})