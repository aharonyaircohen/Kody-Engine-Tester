import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createCorrelationIdMiddleware,
  generateCorrelationId,
  DEFAULT_HEADER,
} from './correlation-id'

describe('generateCorrelationId', () => {
  it('generates unique IDs', () => {
    const id1 = generateCorrelationId()
    const id2 = generateCorrelationId()
    expect(id1).not.toBe(id2)
  })

  it('generates valid UUID v4 format', () => {
    const id = generateCorrelationId()
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where y is 8, 9, a, or b
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
  })

  it('generates 36 character strings', () => {
    const id = generateCorrelationId()
    expect(id.length).toBe(36)
  })
})

describe('DEFAULT_HEADER', () => {
  it('is X-Correlation-ID', () => {
    expect(DEFAULT_HEADER).toBe('X-Correlation-ID')
  })
})

describe('createCorrelationIdMiddleware', () => {
  function makeRequest(path: string, headers?: Record<string, string>): NextRequest {
    return new NextRequest(`http://localhost${path}`, {
      headers,
    })
  }

  describe('correlation ID generation', () => {
    it('generates a new UUID when no correlation ID is provided', () => {
      const mw = createCorrelationIdMiddleware()
      const req = makeRequest('/api/users')
      const res = mw(req)

      const correlationId = res.headers.get('X-Correlation-ID')
      expect(correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    })

    it('generates unique IDs for each request', () => {
      const mw = createCorrelationIdMiddleware()
      const req1 = makeRequest('/api/users')
      const req2 = makeRequest('/api/courses')
      const res1 = mw(req1)
      const res2 = mw(req2)

      expect(res1.headers.get('X-Correlation-ID')).not.toBe(
        res2.headers.get('X-Correlation-ID')
      )
    })
  })

  describe('correlation ID reuse', () => {
    it('uses existing X-Correlation-ID header when provided', () => {
      const mw = createCorrelationIdMiddleware()
      const req = makeRequest('/api/users', { 'x-correlation-id': 'my-custom-id-123' })
      const res = mw(req)

      expect(res.headers.get('X-Correlation-ID')).toBe('my-custom-id-123')
    })

    it('uses existing correlation ID with custom header name', () => {
      const mw = createCorrelationIdMiddleware({ headerName: 'X-Request-Id' })
      const req = makeRequest('/api/users', { 'x-request-id': 'req-id-456' })
      const res = mw(req)

      expect(res.headers.get('X-Request-Id')).toBe('req-id-456')
    })

    it('is case-insensitive for header lookup', () => {
      const mw = createCorrelationIdMiddleware()
      const req = makeRequest('/api/users', { 'X-CORRELATION-ID': 'uppercase-id' })
      const res = mw(req)

      expect(res.headers.get('X-Correlation-ID')).toBe('uppercase-id')
    })
  })

  describe('custom configuration', () => {
    it('uses custom header name when specified', () => {
      const mw = createCorrelationIdMiddleware({ headerName: 'X-Request-Id' })
      const req = makeRequest('/api/users')
      const res = mw(req)

      expect(res.headers.has('X-Request-Id')).toBe(true)
      expect(res.headers.has('X-Correlation-ID')).toBe(false)
    })

    it('uses custom generator when provided', () => {
      const customGenerator = () => 'fixed-id-from-generator'
      const mw = createCorrelationIdMiddleware({ generator: customGenerator })
      const req = makeRequest('/api/users')
      const res = mw(req)

      expect(res.headers.get('X-Correlation-ID')).toBe('fixed-id-from-generator')
    })

    it('prefers existing header over generator', () => {
      const customGenerator = () => 'generated-id'
      const mw = createCorrelationIdMiddleware({ generator: customGenerator })
      const req = makeRequest('/api/users', { 'x-correlation-id': 'existing-id' })
      const res = mw(req)

      expect(res.headers.get('X-Correlation-ID')).toBe('existing-id')
    })
  })

  describe('response behavior', () => {
    it('returns a NextResponse with correlation ID header', () => {
      const mw = createCorrelationIdMiddleware()
      const req = makeRequest('/api/users')
      const res = mw(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('X-Correlation-ID')).toBeTruthy()
    })

    it('always passes through to next middleware', () => {
      const mw = createCorrelationIdMiddleware()
      const req = makeRequest('/api/health')
      const res = mw(req)

      expect(res.status).toBe(200)
    })
  })

  describe('correlation ID format validation', () => {
    it('generates IDs that are valid UUIDs', () => {
      const mw = createCorrelationIdMiddleware()
      const req = makeRequest('/api/users')
      const res = mw(req)
      const correlationId = res.headers.get('X-Correlation-ID')!

      // Verify it's a valid UUID v4
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      expect(correlationId).toMatch(uuidRegex)
    })
  })
})
