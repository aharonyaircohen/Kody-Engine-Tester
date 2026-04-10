import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCorsMiddleware, parseOrigin, stringifyHeaderValue } from './cors-middleware'

describe('createCorsMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(headers: Record<string, string> = {}): NextRequest {
    return new NextRequest('http://localhost/api/test', {
      headers,
    })
  }

  describe('origin option', () => {
    it('sets Access-Control-Allow-Origin when origin is a specific string', () => {
      const mw = createCorsMiddleware({ origin: 'https://example.com' })
      const req = makeRequest({ origin: 'https://example.com' })
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('sets Access-Control-Allow-Origin to request origin when origin is true', () => {
      const mw = createCorsMiddleware({ origin: true })
      const req = makeRequest({ origin: 'https://example.com' })
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('does not set Access-Control-Allow-Origin when origin is false', () => {
      const mw = createCorsMiddleware({ origin: false })
      const req = makeRequest({ origin: 'https://example.com' })
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('matches first origin in array when request origin is not in the list', () => {
      const mw = createCorsMiddleware({ origin: ['https://a.com', 'https://b.com'] })
      const req = makeRequest({ origin: 'https://unknown.com' })
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.com')
    })

    it('matches request origin when it is in the allowed array', () => {
      const mw = createCorsMiddleware({ origin: ['https://a.com', 'https://b.com'] })
      const req = makeRequest({ origin: 'https://b.com' })
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://b.com')
    })

    it('returns null origin when origin is undefined', () => {
      const mw = createCorsMiddleware({})
      const req = makeRequest({ origin: 'https://example.com' })
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })
  })

  describe('methods option', () => {
    it('sets Access-Control-Allow-Methods with default methods', () => {
      const mw = createCorsMiddleware({})
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS')
    })

    it('sets Access-Control-Allow-Methods with custom methods', () => {
      const mw = createCorsMiddleware({ methods: ['GET', 'POST'] })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST')
    })
  })

  describe('allowedHeaders option', () => {
    it('sets Access-Control-Allow-Headers with provided values', () => {
      const mw = createCorsMiddleware({ allowedHeaders: ['Content-Type', 'Authorization'] })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    })

    it('does not set Access-Control-Allow-Headers when allowedHeaders is empty', () => {
      const mw = createCorsMiddleware({ allowedHeaders: [] })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Headers')).toBeNull()
    })
  })

  describe('exposedHeaders option', () => {
    it('sets Access-Control-Expose-Headers with provided values', () => {
      const mw = createCorsMiddleware({ exposedHeaders: ['X-Custom-Header', 'X-Rate-Limit'] })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Expose-Headers')).toBe('X-Custom-Header, X-Rate-Limit')
    })

    it('does not set Access-Control-Expose-Headers when empty', () => {
      const mw = createCorsMiddleware({ exposedHeaders: [] })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Expose-Headers')).toBeNull()
    })
  })

  describe('credentials option', () => {
    it('sets Access-Control-Allow-Credentials to true when enabled', () => {
      const mw = createCorsMiddleware({ credentials: true })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('does not set Access-Control-Allow-Credentials when disabled', () => {
      const mw = createCorsMiddleware({ credentials: false })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull()
    })
  })

  describe('maxAge option', () => {
    it('sets Access-Control-Max-Age with provided value', () => {
      const mw = createCorsMiddleware({ maxAge: 86400 })
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
    })

    it('does not set Access-Control-Max-Age when undefined', () => {
      const mw = createCorsMiddleware({})
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('Access-Control-Max-Age')).toBeNull()
    })
  })

  describe('Vary header', () => {
    it('sets Vary header to Origin when not already present', () => {
      const mw = createCorsMiddleware({})
      const req = makeRequest()
      const res = mw(req)
      expect(res.headers.get('vary')).toBe('Origin')
    })

    it('does not duplicate Origin in Vary header', () => {
      const mw = createCorsMiddleware({})
      const req = makeRequest({ origin: 'https://example.com' })
      const res = mw(req)
      expect(res.headers.get('vary')).toBe('Origin')
    })
  })

  describe('all options combined', () => {
    it('sets all CORS headers correctly', () => {
      const mw = createCorsMiddleware({
        origin: 'https://example.com',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        exposedHeaders: ['X-Custom'],
        credentials: true,
        maxAge: 3600,
      })
      const req = makeRequest({ origin: 'https://example.com' })
      const res = mw(req)

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST')
      expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
      expect(res.headers.get('Access-Control-Expose-Headers')).toBe('X-Custom')
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(res.headers.get('Access-Control-Max-Age')).toBe('3600')
      expect(res.headers.get('vary')).toBe('Origin')
    })
  })

  describe('request without Origin header', () => {
    it('handles request with no Origin header gracefully', () => {
      const mw = createCorsMiddleware({ origin: true })
      const req = new NextRequest('http://localhost/api/test', {})
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('sets headers even when origin option is a specific string but no Origin in request', () => {
      const mw = createCorsMiddleware({ origin: 'https://example.com' })
      const req = new NextRequest('http://localhost/api/test', {})
      const res = mw(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS')
    })
  })
})

describe('parseOrigin', () => {
  it('returns null for undefined origin', () => {
    expect(parseOrigin(undefined, 'https://example.com')).toBeNull()
  })

  it('returns request origin for true', () => {
    expect(parseOrigin(true, 'https://example.com')).toBe('https://example.com')
  })

  it('returns null for false', () => {
    expect(parseOrigin(false, 'https://example.com')).toBeNull()
  })

  it('returns the string for string origin', () => {
    expect(parseOrigin('https://example.com', 'https://other.com')).toBe('https://example.com')
  })

  it('returns matching origin from array', () => {
    expect(parseOrigin(['https://a.com', 'https://b.com'], 'https://b.com')).toBe('https://b.com')
  })

  it('returns first origin from array when no match', () => {
    expect(parseOrigin(['https://a.com', 'https://b.com'], 'https://c.com')).toBe('https://a.com')
  })

  it('returns null when array is empty and no match', () => {
    expect(parseOrigin([], 'https://c.com')).toBeNull()
  })
})

describe('stringifyHeaderValue', () => {
  it('returns undefined for undefined', () => {
    expect(stringifyHeaderValue(undefined)).toBeUndefined()
  })

  it('returns string for string value', () => {
    expect(stringifyHeaderValue('test')).toBe('test')
  })

  it('returns string for number value', () => {
    expect(stringifyHeaderValue(123)).toBe('123')
  })

  it('returns string for boolean value', () => {
    expect(stringifyHeaderValue(true)).toBe('true')
  })

  it('joins array values with comma and space', () => {
    expect(stringifyHeaderValue(['a', 'b', 'c'])).toBe('a, b, c')
  })
})
