import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { createMethodGuard } from './method-guard'

function makeRequest(method: string, url = 'http://localhost/api/test'): NextRequest {
  return new NextRequest(url, { method })
}

describe('createMethodGuard', () => {
  describe('allows allowed methods', () => {
    it('allows GET when GET is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res = guard.middleware(makeRequest('GET'))
      expect(res.status).toBe(200)
    })

    it('allows POST when POST is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['POST'] })
      const res = guard.middleware(makeRequest('POST'))
      expect(res.status).toBe(200)
    })

    it('allows PUT when PUT is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['PUT'] })
      const res = guard.middleware(makeRequest('PUT'))
      expect(res.status).toBe(200)
    })

    it('allows DELETE when DELETE is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['DELETE'] })
      const res = guard.middleware(makeRequest('DELETE'))
      expect(res.status).toBe(200)
    })

    it('allows PATCH when PATCH is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['PATCH'] })
      const res = guard.middleware(makeRequest('PATCH'))
      expect(res.status).toBe(200)
    })

    it('allows HEAD when HEAD is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['HEAD'] })
      const res = guard.middleware(makeRequest('HEAD'))
      expect(res.status).toBe(200)
    })

    it('allows OPTIONS when OPTIONS is in allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['OPTIONS'] })
      const res = guard.middleware(makeRequest('OPTIONS'))
      expect(res.status).toBe(200)
    })

    it('allows multiple methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET', 'POST', 'PUT'] })
      expect(guard.middleware(makeRequest('GET')).status).toBe(200)
      expect(guard.middleware(makeRequest('POST')).status).toBe(200)
      expect(guard.middleware(makeRequest('PUT')).status).toBe(200)
    })

    it('is case-insensitive for allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['get', 'post'] })
      expect(guard.middleware(makeRequest('GET')).status).toBe(200)
      expect(guard.middleware(makeRequest('post')).status).toBe(200)
    })
  })

  describe('blocks disallowed methods', () => {
    it('returns 405 when GET is not allowed', () => {
      const guard = createMethodGuard({ allowedMethods: ['POST'] })
      const res = guard.middleware(makeRequest('GET'))
      expect(res.status).toBe(405)
    })

    it('returns 405 when POST is not allowed', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res = guard.middleware(makeRequest('POST'))
      expect(res.status).toBe(405)
    })

    it('returns 405 when DELETE is not allowed on GET-only route', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res = guard.middleware(makeRequest('DELETE'))
      expect(res.status).toBe(405)
    })

    it('returns 405 when PATCH is not allowed', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET', 'POST'] })
      const res = guard.middleware(makeRequest('PATCH'))
      expect(res.status).toBe(405)
    })

    it('returns 405 when method is not in the allowed list', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'] })
      const res = guard.middleware(makeRequest('PATCH'))
      expect(res.status).toBe(405)
    })

    it('is case-insensitive for disallowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['POST'] })
      expect(guard.middleware(makeRequest('get')).status).toBe(405)
      expect(guard.middleware(makeRequest('Get')).status).toBe(405)
    })
  })

  describe('405 response body', () => {
    it('includes error message', async () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res = guard.middleware(makeRequest('POST'))
      const body = await res.json()
      expect(body.error).toBe('Method Not Allowed')
    })

    it('includes allowed methods in message', async () => {
      const guard = createMethodGuard({ allowedMethods: ['GET', 'POST'] })
      const res = guard.middleware(makeRequest('DELETE'))
      const body = await res.json()
      expect(body.message).toContain('GET')
      expect(body.message).toContain('POST')
    })
  })

  describe('405 response headers', () => {
    it('sets Content-Type to application/json', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res = guard.middleware(makeRequest('POST'))
      expect(res.headers.get('Content-Type')).toBe('application/json')
    })

    it('sets Allow header with allowed methods', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET', 'POST'] })
      const res = guard.middleware(makeRequest('DELETE'))
      expect(res.headers.get('Allow')).toBe('GET, POST')
    })

    it('Allow header contains all allowed methods in order', () => {
      const guard = createMethodGuard({ allowedMethods: ['DELETE', 'GET', 'PATCH'] })
      const res = guard.middleware(makeRequest('POST'))
      expect(res.headers.get('Allow')).toBe('DELETE, GET, PATCH')
    })
  })

  describe('edge cases', () => {
    it('handles single method configuration', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res = guard.middleware(makeRequest('GET'))
      expect(res.status).toBe(200)
    })

    it('handles all methods allowed', () => {
      const guard = createMethodGuard({
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      })
      expect(guard.middleware(makeRequest('GET')).status).toBe(200)
      expect(guard.middleware(makeRequest('POST')).status).toBe(200)
      expect(guard.middleware(makeRequest('PUT')).status).toBe(200)
      expect(guard.middleware(makeRequest('DELETE')).status).toBe(200)
      expect(guard.middleware(makeRequest('PATCH')).status).toBe(200)
      expect(guard.middleware(makeRequest('HEAD')).status).toBe(200)
      expect(guard.middleware(makeRequest('OPTIONS')).status).toBe(200)
    })

    it('handles empty allowed methods list', () => {
      const guard = createMethodGuard({ allowedMethods: [] })
      const res = guard.middleware(makeRequest('GET'))
      expect(res.status).toBe(405)
    })

    it('works with different request URLs', () => {
      const guard = createMethodGuard({ allowedMethods: ['GET'] })
      const res1 = guard.middleware(makeRequest('GET', 'http://localhost/api/users'))
      const res2 = guard.middleware(makeRequest('GET', 'http://localhost/api/posts/123'))
      expect(res1.status).toBe(200)
      expect(res2.status).toBe(200)
    })
  })
})
