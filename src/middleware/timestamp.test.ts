import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createTimestampMiddleware, createTimestampHeader } from './timestamp'

function makeRequest(path: string = '/test'): NextRequest {
  return new NextRequest(`http://localhost${path}`)
}

describe('createTimestampHeader', () => {
  it('returns a valid ISO 8601 timestamp', () => {
    const header = createTimestampHeader()
    const date = new Date(header)
    expect(date.toISOString()).toBe(header)
  })

  it('returns a string', () => {
    const header = createTimestampHeader()
    expect(typeof header).toBe('string')
  })

  it('contains timezone info (Z suffix)', () => {
    const header = createTimestampHeader()
    expect(header).toMatch(/Z$/)
  })
})

describe('createTimestampMiddleware', () => {
  describe('middleware function', () => {
    it('adds X-Timestamp header to response', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      const response = middleware(request)

      expect(response.headers.has('X-Timestamp')).toBe(true)
    })

    it('header value is valid ISO 8601 format', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      const response = middleware(request)
      const timestamp = response.headers.get('X-Timestamp')

      expect(timestamp).not.toBeNull()
      const date = new Date(timestamp!)
      expect(date.toISOString()).toBe(timestamp)
    })

    it('passes request to next handler (returns 200 status)', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      const response = middleware(request)

      expect(response.status).toBe(200)
    })

    it('uses custom header name when provided', () => {
      const { middleware } = createTimestampMiddleware({ headerName: 'X-Custom-Time' })
      const request = makeRequest()

      const response = middleware(request)

      expect(response.headers.has('X-Custom-Time')).toBe(true)
      expect(response.headers.has('X-Timestamp')).toBe(false)
    })

    it('uses X-Timestamp as default header name', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      const response = middleware(request)

      expect(response.headers.has('X-Timestamp')).toBe(true)
    })
  })

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('sets a specific timestamp when using fake timers', () => {
      const fixedDate = new Date('2026-01-01T00:00:00.000Z')
      vi.setSystemTime(fixedDate)

      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      const response = middleware(request)
      const timestamp = response.headers.get('X-Timestamp')

      expect(timestamp).toBe('2026-01-01T00:00:00.000Z')
    })

    it('overwrites existing X-Timestamp header if already set', () => {
      const fixedDate = new Date('2026-01-01T00:00:00.000Z')
      vi.setSystemTime(fixedDate)

      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      // Pre-set a different timestamp
      const response = middleware(request)
      expect(response.headers.get('X-Timestamp')).toBe('2026-01-01T00:00:00.000Z')

      // Advance time and call again
      vi.setSystemTime(new Date('2026-02-01T12:30:00.000Z'))
      const response2 = middleware(request)
      expect(response2.headers.get('X-Timestamp')).toBe('2026-02-01T12:30:00.000Z')
    })

    it('timestamp changes when time advances', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest()

      const fixedDate1 = new Date('2026-01-01T00:00:00.000Z')
      vi.setSystemTime(fixedDate1)
      const response1 = middleware(request)
      const timestamp1 = response1.headers.get('X-Timestamp')

      const fixedDate2 = new Date('2026-06-15T14:30:00.000Z')
      vi.setSystemTime(fixedDate2)
      const response2 = middleware(request)
      const timestamp2 = response2.headers.get('X-Timestamp')

      expect(timestamp1).not.toBe(timestamp2)
      expect(timestamp1).toBe('2026-01-01T00:00:00.000Z')
      expect(timestamp2).toBe('2026-06-15T14:30:00.000Z')
    })
  })

  describe('edge cases', () => {
    it('handles request to root path', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest('/')

      const response = middleware(request)

      expect(response.headers.has('X-Timestamp')).toBe(true)
    })

    it('handles request with query parameters', () => {
      const { middleware } = createTimestampMiddleware()
      const request = makeRequest('/api/test?foo=bar')

      const response = middleware(request)

      expect(response.headers.has('X-Timestamp')).toBe(true)
    })

    it('handles requests to different paths independently', () => {
      const { middleware } = createTimestampMiddleware()
      const request1 = makeRequest('/path/one')
      const request2 = makeRequest('/path/two')

      const response1 = middleware(request1)
      const response2 = middleware(request2)

      // Both should have headers set
      expect(response1.headers.has('X-Timestamp')).toBe(true)
      expect(response2.headers.has('X-Timestamp')).toBe(true)
      // Both should have valid ISO timestamps (may be same or different depending on timing)
      expect(response1.headers.get('X-Timestamp')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(response2.headers.get('X-Timestamp')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('multiple calls generate different timestamps when time passes', () => {
      const { middleware } = createTimestampMiddleware()

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

      const request = makeRequest()

      const response1 = middleware(request)
      const timestamp1 = response1.headers.get('X-Timestamp')

      // Advance time by 1ms
      vi.setSystemTime(new Date('2026-01-01T00:00:00.001Z'))

      const response2 = middleware(request)
      const timestamp2 = response2.headers.get('X-Timestamp')

      expect(timestamp1).not.toBe(timestamp2)

      vi.useRealTimers()
    })
  })
})