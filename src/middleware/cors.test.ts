import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCorsMiddleware, CorsMiddlewareConfig } from './cors'

describe('createCorsMiddleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function makeRequest(
    method: string,
    origin: string,
    headers?: Record<string, string>
  ): NextRequest {
    const req = new NextRequest('http://localhost/api/test', {
      method,
      headers: { origin, ...headers },
    })
    return req
  }

  describe('allowed origin passes through with CORS headers', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
    }

    it('sets Access-Control-Allow-Origin for GET requests', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('sets Access-Control-Allow-Methods for GET requests', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS'
      )
    })

    it('sets Access-Control-Allow-Headers for GET requests', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
      )
    })

    it('allows POST requests with CORS headers', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('POST', 'https://example.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('allows PUT requests with CORS headers', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('PUT', 'https://example.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('allows DELETE requests with CORS headers', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('DELETE', 'https://example.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('allows PATCH requests with CORS headers', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('PATCH', 'https://example.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })
  })

  describe('disallowed origin returns 403 with CORS headers', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
    }

    it('returns 403 for disallowed origin', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://evil.com'))
      expect(res.status).toBe(403)
    })

    it('returns 403 with JSON error body', async () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://evil.com'))
      const body = await res.json()
      expect(body.error).toBe('Forbidden: CORS policy violation')
    })

    it('still sets CORS headers on 403 response', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://evil.com'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://evil.com')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS'
      )
    })
  })

  describe('OPTIONS preflight requests', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
      maxAge: 3600,
    }

    it('returns 200 for OPTIONS preflight with allowed origin', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://example.com'))
      expect(res.status).toBe(200)
    })

    it('sets Access-Control-Max-Age on preflight response', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://example.com'))
      expect(res.headers.get('Access-Control-Max-Age')).toBe('3600')
    })

    it('returns 200 for OPTIONS preflight without CORS headers for disallowed origin', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://evil.com'))
      // Preflight returns 200 even for disallowed origins, but without CORS headers
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('sets CORS headers on preflight for allowed origin', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS'
      )
    })

    it('preflight works without origin header', () => {
      const mw = createCorsMiddleware(config)
      const req = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
        headers: {},
      })
      const res = mw(req)
      expect(res.status).toBe(200)
    })
  })

  describe('multiple allowed origins support', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com', 'https://trusted.com'],
    }

    it('allows first configured origin', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('allows second configured origin', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://trusted.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://trusted.com')
    })

    it('blocks unlisted origins', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://other.com'))
      expect(res.status).toBe(403)
    })
  })

  describe('wildcard origin support', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['*'],
    }

    it('allows any origin when wildcard is configured', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://any-site.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://any-site.com')
    })
  })

  describe('credential headers respected', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
      allowCredentials: true,
    }

    it('sets Access-Control-Allow-Credentials header', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('does not set credentials header when disabled', () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull()
    })
  })

  describe('custom allowed methods', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
      allowedMethods: ['GET', 'POST'],
    }

    it('only includes configured methods in Access-Control-Allow-Methods', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST')
    })
  })

  describe('custom allowed headers', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
      allowedHeaders: ['Content-Type', 'X-Custom-Header'],
    }

    it('only includes configured headers in Access-Control-Allow-Headers', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, X-Custom-Header')
    })
  })

  describe('custom maxAge', () => {
    it('uses custom maxAge value', () => {
      const config: CorsMiddlewareConfig = {
        allowedOrigins: ['https://example.com'],
        maxAge: 7200,
      }
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://example.com'))
      expect(res.headers.get('Access-Control-Max-Age')).toBe('7200')
    })

    it('defaults maxAge to 86400', () => {
      const config: CorsMiddlewareConfig = {
        allowedOrigins: ['https://example.com'],
      }
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://example.com'))
      expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
    })

    it('does not set maxAge when zero', () => {
      const config: CorsMiddlewareConfig = {
        allowedOrigins: ['https://example.com'],
        maxAge: 0,
      }
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('OPTIONS', 'https://example.com'))
      expect(res.headers.get('Access-Control-Max-Age')).toBeNull()
    })
  })

  describe('custom origin resolver', () => {
    it('uses custom origin resolver', () => {
      const config: CorsMiddlewareConfig = {
        allowedOrigins: ['https://example.com'],
        originResolver: () => 'https://resolved.com',
      }
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://ignored.com'))
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://resolved.com')
    })

    it('origin resolver returning null blocks request', () => {
      const config: CorsMiddlewareConfig = {
        allowedOrigins: ['https://example.com'],
        originResolver: () => null,
      }
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('GET', 'https://example.com'))
      expect(res.status).toBe(403)
    })
  })

  describe('HEAD method passthrough', () => {
    const config: CorsMiddlewareConfig = {
      allowedOrigins: ['https://example.com'],
    }

    it('allows HEAD requests', () => {
      const mw = createCorsMiddleware(config)
      const res = mw(makeRequest('HEAD', 'https://example.com'))
      expect(res.status).toBe(200)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })
  })
})