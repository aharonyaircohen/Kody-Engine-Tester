import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createTimestampMiddleware, type TimestampMiddlewareConfig } from './timestamp-middleware'

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createTimestampMiddleware', () => {
  describe('middleware', () => {
    it('adds x-timestamp header with Unix timestamp', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.has('x-timestamp')).toBe(true)
      const timestampHeader = response.headers.get('x-timestamp')
      expect(timestampHeader).not.toBeNull()

      const timestamp = parseInt(timestampHeader!, 10)
      const now = Math.floor(Date.now() / 1000)
      expect(timestamp).toBeGreaterThanOrEqual(now - 1)
      expect(timestamp).toBeLessThanOrEqual(now + 1)
    })

    it('adds custom header name when specified', () => {
      const config: TimestampMiddlewareConfig = { headerName: 'x-custom-timestamp' }
      const timestampMiddleware = createTimestampMiddleware(config)
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.has('x-custom-timestamp')).toBe(true)
      expect(response.headers.has('x-timestamp')).toBe(false)
    })

    it('calls next() to continue middleware chain', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.status).toBe(200)
    })

    it('handles request and response objects correctly', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/users/123')
      const response = timestampMiddleware.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.headers.get('x-timestamp')).toBeDefined()
    })

    it('timestamp is a positive integer string', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      const timestampHeader = response.headers.get('x-timestamp')
      expect(timestampHeader).toMatch(/^\d+$/)
      const timestamp = parseInt(timestampHeader!, 10)
      expect(timestamp).toBeGreaterThan(0)
    })

    it('produces different timestamps for requests at different times', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))

      const timestampMiddleware = createTimestampMiddleware()
      const req1 = makeRequest('/api/test')
      const response1 = timestampMiddleware.middleware(req1)
      const timestamp1 = response1.headers.get('x-timestamp')

      vi.advanceTimersByTime(2000)

      const req2 = makeRequest('/api/test')
      const response2 = timestampMiddleware.middleware(req2)
      const timestamp2 = response2.headers.get('x-timestamp')

      expect(timestamp1).not.toBe(timestamp2)
      expect(parseInt(timestamp2!, 10)).toBe(parseInt(timestamp1!, 10) + 2)

      vi.useRealTimers()
    })

    it('works with various request paths', () => {
      const timestampMiddleware = createTimestampMiddleware()

      const paths = ['/', '/api', '/api/users/123', '/dashboard/settings', '/health']
      for (const path of paths) {
        const req = makeRequest(path)
        const response = timestampMiddleware.middleware(req)
        expect(response.headers.get('x-timestamp')).toBeDefined()
      }
    })
  })

  describe('configuration', () => {
    it('uses default header name when not specified', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.has('x-timestamp')).toBe(true)
    })

    it('handles empty config object', () => {
      const timestampMiddleware = createTimestampMiddleware({})
      const req = makeRequest('/api/test')
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.get('x-timestamp')).toBeDefined()
    })
  })

  describe('error cases', () => {
    it('handles request with no body', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = makeRequest('/api/empty')
      const response = timestampMiddleware.middleware(req)

      expect(response.status).toBe(200)
      expect(response.headers.get('x-timestamp')).toBeDefined()
    })

    it('handles request with query parameters', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = new NextRequest('http://localhost/api/search?q=test&page=1')
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.get('x-timestamp')).toBeDefined()
    })

    it('handles POST request', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })
      const response = timestampMiddleware.middleware(req)

      expect(response.status).toBe(200)
      expect(response.headers.get('x-timestamp')).toBeDefined()
    })

    it('handles request with custom headers', () => {
      const timestampMiddleware = createTimestampMiddleware()
      const req = new NextRequest('http://localhost/api/test', {
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer token123',
        },
      })
      const response = timestampMiddleware.middleware(req)

      expect(response.headers.get('x-timestamp')).toBeDefined()
      expect(response.headers.get('content-type')).toBeNull()
    })
  })
})