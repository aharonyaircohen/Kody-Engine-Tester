import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { createRequestTiming, formatMs, type RequestTimingConfig } from './request-timing'

function makeRequest(path: string): NextRequest {
  const req = new NextRequest(`http://localhost${path}`)
  return req
}

describe('formatMs', () => {
  it('returns "<1ms" for values less than 1', () => {
    expect(formatMs(0)).toBe('<1ms')
    expect(formatMs(0.5)).toBe('<1ms')
    expect(formatMs(0.9)).toBe('<1ms')
  })

  it('returns rounded ms for values under 1000', () => {
    expect(formatMs(1)).toBe('1ms')
    expect(formatMs(50)).toBe('50ms')
    expect(formatMs(999)).toBe('999ms')
    expect(formatMs(1.5)).toBe('2ms')
  })

  it('returns seconds format for values 1000 and above', () => {
    expect(formatMs(1000)).toBe('1.00s')
    expect(formatMs(1500)).toBe('1.50s')
    expect(formatMs(2000)).toBe('2.00s')
    expect(formatMs(1234)).toBe('1.23s')
  })
})

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

    it('adds X-Request-Id header to response', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Request-Id')).toBe(true)
      expect(response.headers.get('X-Request-Id')).toMatch(/^\d+-[a-z0-9]+$/)
    })

    it('sets response time header value in milliseconds by default', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).toBe('0')
    })

    it('sets response time header as string format when configured', () => {
      const timing = createRequestTiming({ format: 'string' })
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const headerValue = response.headers.get('X-Response-Time')
      expect(headerValue).toBe('<1ms')
    })

    it('skips excluded paths', () => {
      const timing = createRequestTiming({
        excludePaths: ['/health', '/favicon.ico'],
      })

      const healthReq = makeRequest('/health')
      const healthResponse = timing.middleware(healthReq)

      expect(healthResponse.headers.has('X-Response-Time')).toBe(false)
      expect(healthResponse.headers.has('X-Request-Id')).toBe(false)
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

    it('skips path that is substring of excluded path when exact match required', () => {
      const timing = createRequestTiming({ excludePaths: ['/api'] })

      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      // /api/test should NOT be excluded because excluded set contains exact /api only
      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('returns NextResponse.next() for non-excluded paths', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/users')
      const response = timing.middleware(req)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })
  })

  describe('getHeaderValue', () => {
    it('returns response time as numeric string by default', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const value = timing.getHeaderValue(req, response)
      expect(value).toBe('0')
    })

    it('returns formatted string when format is string', () => {
      const timing = createRequestTiming({ format: 'string' })
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      const value = timing.getHeaderValue(req, response)
      expect(value).toBe('<1ms')
    })

    it('returns value for request with existing request ID header', () => {
      const timing = createRequestTiming()
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)
      const requestId = response.headers.get('X-Request-Id')!

      // Create a new response with the same request ID
      const newResponse = NextResponse.next()
      newResponse.headers.set('X-Request-Id', requestId)

      const value = timing.getHeaderValue(req, newResponse)
      expect(value).toBeDefined()
    })
  })

  describe('configuration options', () => {
    it('accepts custom headerName', () => {
      const timing = createRequestTiming({ headerName: 'X-Custom-Timing' })
      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Custom-Timing')).toBe(true)
      expect(response.headers.has('X-Response-Time')).toBe(false)
    })

    it('accepts custom excludePaths', () => {
      const timing = createRequestTiming({
        excludePaths: ['/api/private', '/api/secret'],
      })

      const privateReq = makeRequest('/api/private')
      const privateResponse = timing.middleware(privateReq)
      expect(privateResponse.headers.has('X-Response-Time')).toBe(false)

      const publicReq = makeRequest('/api/public')
      const publicResponse = timing.middleware(publicReq)
      expect(publicResponse.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles empty excludePaths', () => {
      const timing = createRequestTiming({ excludePaths: [] })

      const req = makeRequest('/any/path')
      const response = timing.middleware(req)

      expect(response.headers.has('X-Response-Time')).toBe(true)
    })

    it('handles both custom headerName and format', () => {
      const timing = createRequestTiming({
        headerName: 'Server-Timing',
        format: 'string',
      })

      const req = makeRequest('/api/test')
      const response = timing.middleware(req)

      expect(response.headers.has('Server-Timing')).toBe(true)
      const headerValue = response.headers.get('Server-Timing')
      expect(headerValue).toBe('<1ms')
    })
  })
})

describe('configuration edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles undefined config', () => {
    const timing = createRequestTiming(undefined as unknown as RequestTimingConfig)
    const req = makeRequest('/api/test')
    const response = timing.middleware(req)

    expect(response.headers.has('X-Response-Time')).toBe(true)
  })

  it('handles empty config object', () => {
    const timing = createRequestTiming({})
    const req = makeRequest('/api/test')
    const response = timing.middleware(req)

    expect(response.headers.has('X-Response-Time')).toBe(true)
  })
})
