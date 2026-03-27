import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createCsrfMiddleware } from './csrf-middleware'
import { CsrfTokenService } from '../security/csrf-token'

function makeRequest(
  method: string,
  sessionId?: string,
  csrfToken?: string
): NextRequest {
  const url = new URL('http://localhost/api/test')
  const headers: Record<string, string> = {}
  if (sessionId) headers['x-session-id'] = sessionId
  if (csrfToken) headers['x-csrf-token'] = csrfToken

  return new NextRequest(url, {
    method,
    headers,
  })
}

describe('createCsrfMiddleware', () => {
  let tokenService: CsrfTokenService
  let middleware: ReturnType<typeof createCsrfMiddleware>

  beforeEach(() => {
    tokenService = new CsrfTokenService({ ttlMs: 30 * 60 * 1000 })
    middleware = createCsrfMiddleware({ tokenService })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('safe methods bypass', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      it(`should bypass ${method} requests`, async () => {
        const req = makeRequest(method)
        const res = await middleware.async(req)
        expect(res.status).not.toBe(403)
      })
    }

    it('should bypass GET even without session ID', async () => {
      const req = makeRequest('GET')
      const res = await middleware.async(req)
      expect(res.status).not.toBe(403)
    })
  })

  describe('missing session ID', () => {
    it('should return 403 when session ID header is missing', async () => {
      const req = makeRequest('POST')
      const res = await middleware.async(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('session ID')
    })
  })

  describe('missing CSRF token', () => {
    it('should return 403 when X-CSRF-Token header is missing', async () => {
      await tokenService.generate('session-1')
      const req = makeRequest('POST', 'session-1')
      const res = await middleware.async(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Missing CSRF token')
    })
  })

  describe('valid token', () => {
    it('should allow request with valid token and inject new token', async () => {
      const token = await tokenService.generate('session-1')
      const req = makeRequest('POST', 'session-1', token)
      const res = await middleware.async(req)
      expect(res.status).not.toBe(403)
      const newToken = res.headers.get('x-csrf-token')
      expect(newToken).toBeDefined()
      expect(newToken).not.toBe(token)
    })

    it('should allow multiple requests using rotated tokens', async () => {
      const t1 = await tokenService.generate('session-1')
      const r1 = await middleware.async(makeRequest('POST', 'session-1', t1))
      expect(r1.status).not.toBe(403)
      const t2 = r1.headers.get('x-csrf-token')!

      const r2 = await middleware.async(makeRequest('POST', 'session-1', t2))
      expect(r2.status).not.toBe(403)
      const t3 = r2.headers.get('x-csrf-token')!
      expect(t3).not.toBe(t2)
    })
  })

  describe('invalid token', () => {
    it('should return 403 for unknown session token', async () => {
      // No token generated, just validate against unknown session
      const req = makeRequest('POST', 'session-1', 'some-token')
      const res = await middleware.async(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('CSRF token not found')
    })

    it('should return 403 for wrong token', async () => {
      await tokenService.generate('session-1')
      const req = makeRequest('POST', 'session-1', 'wrong-token')
      const res = await middleware.async(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Invalid CSRF token')
    })

    it('should return 403 for expired token', async () => {
      vi.useFakeTimers()
      const shortTtl = new CsrfTokenService({ ttlMs: 1000 })
      const token = await shortTtl.generate('session-1')
      const shortMw = createCsrfMiddleware({ tokenService: shortTtl })

      vi.advanceTimersByTime(1001)
      const req = makeRequest('POST', 'session-1', token)
      const res = await shortMw.async(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('expired')
    })
  })

  describe('single-use enforcement', () => {
    it('should reject reuse of the same token', async () => {
      const token = await tokenService.generate('session-1')
      await middleware.async(makeRequest('POST', 'session-1', token))
      const res = await middleware.async(makeRequest('POST', 'session-1', token))
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toContain('Invalid CSRF token')
    })
  })

  describe('custom session ID resolver', () => {
    it('should use custom session ID resolver', async () => {
      const token = await tokenService.generate('custom-session')
      const mw = createCsrfMiddleware({
        tokenService,
        sessionIdResolver: (req) => req.headers.get('x-custom-session'),
      })
      const req = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        headers: { 'x-csrf-token': token, 'x-custom-session': 'custom-session' },
      })
      const res = await mw.async(req)
      expect(res.status).not.toBe(403)
    })

    it('should return 403 when custom resolver returns null', async () => {
      const mw = createCsrfMiddleware({
        tokenService,
        sessionIdResolver: () => null,
      })
      const req = makeRequest('POST', 'session-1', 'any-token')
      const res = await mw.async(req)
      expect(res.status).toBe(403)
    })
  })

  describe('response headers', () => {
    it('should not inject token header on safe methods', async () => {
      const req = makeRequest('GET', 'session-1')
      const res = await middleware.async(req)
      expect(res.headers.has('x-csrf-token')).toBe(false)
    })

    it('should inject new token on successful POST', async () => {
      const token = await tokenService.generate('session-1')
      const req = makeRequest('POST', 'session-1', token)
      const res = await middleware.async(req)
      expect(res.headers.get('x-csrf-token')).toHaveLength(64)
    })

    it('should not inject token on failed validation', async () => {
      const req = makeRequest('POST', 'session-1', 'bad-token')
      const res = await middleware.async(req)
      expect(res.headers.has('x-csrf-token')).toBe(false)
    })
  })
})
