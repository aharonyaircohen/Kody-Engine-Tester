import { describe, it, expect, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCorsMiddleware, DEFAULT_CORS_CONFIG, isOriginAllowed, buildCorsHeaders } from './cors-middleware'

describe('CorsMiddlewareConfig', () => {
  it('has correct default values', () => {
    expect(DEFAULT_CORS_CONFIG.origin).toEqual(['http://localhost:3000'])
    expect(DEFAULT_CORS_CONFIG.methods).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
    expect(DEFAULT_CORS_CONFIG.credentials).toBe(false)
  })
})

describe('isOriginAllowed', () => {
  it('returns true when origin is in allowed list', () => {
    expect(isOriginAllowed('http://localhost:3000', ['http://localhost:3000'])).toBe(true)
  })

  it('returns false when origin is not in allowed list', () => {
    expect(isOriginAllowed('http://example.com', ['http://localhost:3000'])).toBe(false)
  })

  it('returns false when origin is null', () => {
    expect(isOriginAllowed(null, ['http://localhost:3000'])).toBe(false)
  })

  it('returns true when wildcard is in allowed list', () => {
    expect(isOriginAllowed('http://any-origin.com', ['*'])).toBe(true)
  })

  it('returns true when origin matches wildcard pattern', () => {
    expect(isOriginAllowed('https://app.example.com', ['*'])).toBe(true)
  })
})

describe('buildCorsHeaders', () => {
  it('sets Access-Control-Allow-Origin from request origin when not wildcard', () => {
    const config = { origin: ['http://localhost:3000'], methods: ['GET'], credentials: false }
    const headers = buildCorsHeaders(config, 'http://localhost:3000')
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000')
  })

  it('sets wildcard origin when configured', () => {
    const config = { origin: ['*'], methods: ['GET'], credentials: false }
    const headers = buildCorsHeaders(config, 'http://any-origin.com')
    expect(headers['Access-Control-Allow-Origin']).toBe('*')
  })

  it('sets Access-Control-Allow-Credentials to true when enabled', () => {
    const config = { origin: ['http://localhost:3000'], methods: ['GET'], credentials: true }
    const headers = buildCorsHeaders(config, 'http://localhost:3000')
    expect(headers['Access-Control-Allow-Credentials']).toBe('true')
  })

  it('does not set Access-Control-Allow-Credentials when disabled', () => {
    const config = { origin: ['http://localhost:3000'], methods: ['GET'], credentials: false }
    const headers = buildCorsHeaders(config, 'http://localhost:3000')
    expect(headers['Access-Control-Allow-Credentials']).toBeUndefined()
  })

  it('sets Access-Control-Allow-Methods with all configured methods', () => {
    const config = { origin: ['http://localhost:3000'], methods: ['GET', 'POST', 'DELETE'], credentials: false }
    const headers = buildCorsHeaders(config, 'http://localhost:3000')
    expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, DELETE')
  })

  it('sets standard allowed headers', () => {
    const config = { origin: ['http://localhost:3000'], methods: ['GET'], credentials: false }
    const headers = buildCorsHeaders(config, 'http://localhost:3000')
    expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization, X-Requested-With')
  })
})

describe('createCorsMiddleware', () => {
  afterEach(() => {
    // No cleanup needed for CORS middleware since it has no state
  })

  function makeRequest(method: string, origin: string | null = 'http://localhost:3000', path = 'http://localhost/api/test'): NextRequest {
    const headers: Record<string, string> = {}
    if (origin) {
      headers['origin'] = origin
    }
    const req = new NextRequest(path, {
      method,
      headers,
    })
    return req
  }

  describe('OPTIONS preflight requests', () => {
    it('returns 204 with CORS headers for allowed origin', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      })
      const res = mw(makeRequest('OPTIONS', 'http://localhost:3000'))
      expect(res.status).toBe(204)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST')
    })

    it('returns 403 for disallowed origin on OPTIONS', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('OPTIONS', 'http://evil.com'))
      expect(res.status).toBe(403)
    })

    it('returns 204 with wildcard origin when configured', () => {
      const mw = createCorsMiddleware({
        origin: ['*'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('OPTIONS', 'http://any-origin.com'))
      expect(res.status).toBe(204)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('returns 403 when origin header is missing on OPTIONS', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('OPTIONS', null))
      expect(res.status).toBe(403)
    })
  })

  describe('actual requests (non-OPTIONS)', () => {
    it('adds CORS headers for allowed origin', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      })
      const res = mw(makeRequest('GET', 'http://localhost:3000'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST')
    })

    it('does not add CORS headers for disallowed origin', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('GET', 'http://evil.com'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull()
    })

    it('passes through request without adding CORS headers when origin is not allowed', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('POST', 'http://other.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('adds wildcard origin when configured', () => {
      const mw = createCorsMiddleware({
        origin: ['*'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('GET', 'http://any-origin.com'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('handles requests without origin header', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('GET', null))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })
  })

  describe('configuration merging', () => {
    it('uses default config when no config provided', () => {
      const mw = createCorsMiddleware()
      const res = mw(makeRequest('OPTIONS', 'http://localhost:3000'))
      expect(res.status).toBe(204)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
    })

    it('merges partial config with defaults', () => {
      const mw = createCorsMiddleware({
        origin: ['http://example.com'],
      })
      const res = mw(makeRequest('OPTIONS', 'http://example.com'))
      expect(res.status).toBe(204)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, PATCH, OPTIONS')
    })

    it('allows config to override default methods', () => {
      const mw = createCorsMiddleware({
        methods: ['POST', 'PUT'],
      })
      const res = mw(makeRequest('OPTIONS', 'http://localhost:3000'))
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST, PUT')
    })

    it('allows config to enable credentials', () => {
      const mw = createCorsMiddleware({
        credentials: true,
      })
      const res = mw(makeRequest('OPTIONS', 'http://localhost:3000'))
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })
  })

  describe('multiple allowed origins', () => {
    it('allows one of multiple configured origins', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'https://app.example.com'],
        methods: ['GET'],
        credentials: false,
      })

      const res1 = mw(makeRequest('OPTIONS', 'http://localhost:3000'))
      expect(res1.status).toBe(204)

      const res2 = mw(makeRequest('OPTIONS', 'http://localhost:3001'))
      expect(res2.status).toBe(204)

      const res3 = mw(makeRequest('OPTIONS', 'https://app.example.com'))
      expect(res3.status).toBe(204)
    })

    it('rejects origin not in the list', () => {
      const mw = createCorsMiddleware({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET'],
        credentials: false,
      })
      const res = mw(makeRequest('OPTIONS', 'http://other.com'))
      expect(res.status).toBe(403)
    })
  })
})
