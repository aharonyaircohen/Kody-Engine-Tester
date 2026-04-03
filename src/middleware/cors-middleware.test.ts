import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { createCorsMiddleware } from './cors-middleware'

function makeRequest(
  method: string,
  origin: string,
  extraHeaders: Record<string, string> = {}
): NextRequest {
  const url = new URL('http://localhost/api/test')
  const headers: Record<string, string> = { origin }
  for (const [key, value] of Object.entries(extraHeaders)) {
    headers[key] = value
  }

  return new NextRequest(url, {
    method,
    headers,
  })
}

describe('createCorsMiddleware', () => {
  describe('allowed origins', () => {
    it('should allow requests from whitelisted origin', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('should deny requests from non-whitelisted origin', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('GET', 'https://other.com')
      const res = await mw.async(req)
      expect(res.headers.has('Access-Control-Allow-Origin')).toBe(false)
    })

    it('should allow requests when origin matches function predicate', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: (origin) => origin.startsWith('https://trusted-'),
      })
      const req = makeRequest('GET', 'https://trusted-domain.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://trusted-domain.com')
    })

    it('should deny requests when origin fails function predicate', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: (origin) => origin.startsWith('https://trusted-'),
      })
      const req = makeRequest('GET', 'https://untrusted.com')
      const res = await mw.async(req)
      expect(res.headers.has('Access-Control-Allow-Origin')).toBe(false)
    })

    it('should handle multiple allowed origins', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://a.com', 'https://b.com', 'https://c.com'],
      })
      const req1 = makeRequest('GET', 'https://b.com')
      const req2 = makeRequest('GET', 'https://c.com')
      expect((await mw.async(req1)).headers.get('Access-Control-Allow-Origin')).toBe('https://b.com')
      expect((await mw.async(req2)).headers.get('Access-Control-Allow-Origin')).toBe('https://c.com')
    })

    it('should handle wildcard origin', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['*'] })
      const req = makeRequest('GET', 'https://any.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('allowed methods', () => {
    it('should return allowed methods in preflight response', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        allowedMethods: ['GET', 'POST', 'DELETE'],
      })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-method': 'POST',
      })
      const res = await mw.async(req)
      const methods = res.headers.get('Access-Control-Allow-Methods') ?? ''
      expect(methods).toContain('GET')
      expect(methods).toContain('POST')
      expect(methods).toContain('DELETE')
    })

    it('should use default methods when not specified', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-method': 'PATCH',
      })
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('PATCH')
    })

    it('should echo back requested method even if not in allowed list', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        allowedMethods: ['GET', 'POST'],
      })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-method': 'DELETE',
      })
      const res = await mw.async(req)
      // Per CORS spec, the response echoes back the requested method
      expect(res.headers.get('Access-Control-Allow-Methods')).toBe('DELETE')
    })
  })

  describe('allowed headers', () => {
    it('should return allowed headers in preflight response', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom'],
      })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-headers': 'content-type,authorization,x-custom',
      })
      const res = await mw.async(req)
      const allowHeader = res.headers.get('Access-Control-Allow-Headers') ?? ''
      expect(allowHeader).toContain('authorization')
      expect(allowHeader).toContain('content-type')
      expect(allowHeader).toContain('x-custom')
    })

    it('should only include requested headers that are in allowed list', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-headers': 'content-type,x-disallowed-header,authorization',
      })
      const res = await mw.async(req)
      const allowHeader = res.headers.get('Access-Control-Allow-Headers') ?? ''
      expect(allowHeader).toContain('authorization')
      expect(allowHeader).toContain('content-type')
      expect(allowHeader).not.toContain('x-disallowed-header')
    })

    it('should use default allowed headers when not specified', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-headers': 'content-type,authorization',
      })
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Headers')).toContain('authorization')
      expect(res.headers.get('Access-Control-Allow-Headers')).toContain('content-type')
    })
  })

  describe('exposed headers', () => {
    it('should include exposed headers in response', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        exposedHeaders: ['X-Rate-Limit', 'X-Request-Id'],
      })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Expose-Headers')).toBe('X-Rate-Limit, X-Request-Id')
    })

    it('should not include expose headers when none specified', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.has('Access-Control-Expose-Headers')).toBe(false)
    })
  })

  describe('credentials', () => {
    it('should include credentials header when enabled and origin is not wildcard', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        supportsCredentials: true,
      })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('should not include credentials header when origin is wildcard', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['*'],
        supportsCredentials: false,
      })
      const req = makeRequest('GET', 'https://any.com')
      const res = await mw.async(req)
      expect(res.headers.has('Access-Control-Allow-Credentials')).toBe(false)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('does not use wildcard origin when credentials are allowed', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['*'],
        supportsCredentials: true,
      })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true')
    })

    it('should not include credentials header when disabled', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        supportsCredentials: false,
      })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.has('Access-Control-Allow-Credentials')).toBe(false)
    })
  })

  describe('max age', () => {
    it('should include max age in preflight response', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        maxAge: 3600,
      })
      const req = makeRequest('OPTIONS', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Max-Age')).toBe('3600')
    })

    it('should use default max age when not specified', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('OPTIONS', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
    })
  })

  describe('preflight requests', () => {
    it('should return 204 for OPTIONS preflight', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('OPTIONS', 'https://example.com')
      const res = await mw.async(req)
      expect(res.status).toBe(204)
    })

    it('should handle preflight without origin header', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const url = new URL('http://localhost/api/test')
      const req = new NextRequest(url, { method: 'OPTIONS' })
      const res = await mw.async(req)
      expect(res.status).toBe(204)
    })

    it('should allow preflight from whitelisted origin', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('OPTIONS', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('should deny preflight from non-whitelisted origin', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('OPTIONS', 'https://evil.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('null')
    })
  })

  describe('non-preflight requests', () => {
    it('should add CORS headers to GET requests', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('should add CORS headers to POST requests', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('POST', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })

    it('should not modify response body for non-preflight requests', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.status).toBe(200)
    })
  })

  describe('edge cases', () => {
    it('should handle empty allowed origins array', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: [] })
      const req = makeRequest('GET', 'https://example.com')
      const res = await mw.async(req)
      expect(res.headers.has('Access-Control-Allow-Origin')).toBe(false)
    })

    it('should handle case-insensitive header matching', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        allowedHeaders: ['Content-Type'],
      })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-headers': 'CONTENT-TYPE',
      })
      const res = await mw.async(req)
      expect(res.headers.get('Access-Control-Allow-Headers')).toBe('content-type')
    })

    it('should handle multiple headers in access-control-request-headers', async () => {
      const mw = createCorsMiddleware({
        allowedOrigins: ['https://example.com'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
      })
      const req = makeRequest('OPTIONS', 'https://example.com', {
        'access-control-request-headers': 'content-type, x-custom-header, authorization',
      })
      const res = await mw.async(req)
      const allowedHeaders = res.headers.get('Access-Control-Allow-Headers')
      expect(allowedHeaders).toContain('authorization')
      expect(allowedHeaders).toContain('content-type')
      expect(allowedHeaders).toContain('x-custom-header')
    })

    it('should not duplicate headers on multiple calls', async () => {
      const mw = createCorsMiddleware({ allowedOrigins: ['https://example.com'] })
      const req = makeRequest('GET', 'https://example.com')

      const res1 = await mw.async(req)
      const res2 = await mw.async(req)

      expect(res1.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
      expect(res2.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
    })
  })
})
