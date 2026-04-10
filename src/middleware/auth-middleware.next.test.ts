import { describe, it, expect, beforeEach } from 'vitest'
import { createAuthMiddleware } from '../middleware'
import { JwtService } from '../auth/jwt-service'

describe('AuthMiddleware (Next.js)', () => {
  let jwtService: JwtService
  let middleware: ReturnType<typeof createAuthMiddleware>

  beforeEach(() => {
    jwtService = new JwtService('test-secret')
    middleware = createAuthMiddleware({ jwtService })
  })

  function createNextRequest(path: string, authHeader?: string): Request {
    const req = new Request(`http://localhost${path}`, {
      method: 'GET',
      headers: authHeader ? { authorization: authHeader } : {},
    })
    return req
  }

  // Convert Web API Request to NextRequest-like object for testing
  function toNextRequest(req: Request) {
    return {
      nextUrl: { pathname: new URL(req.url).pathname },
      headers: req.headers,
      method: req.method,
    } as unknown as import('next/server').NextRequest
  }

  describe('path exclusion', () => {
    it('should pass through excluded paths without auth', async () => {
      const middlewareFn = createAuthMiddleware({
        jwtService,
        excludePaths: ['/login', '/register'],
      })

      const req = toNextRequest(createNextRequest('/login'))
      const response = await middlewareFn(req)
      expect(response.status).toBe(200)
    })

    it('should pass through /health without auth', async () => {
      const req = toNextRequest(createNextRequest('/health'))
      const response = await middleware(req)
      expect(response.status).toBe(200)
    })

    it('should pass through /api/auth/* without auth', async () => {
      const req = toNextRequest(createNextRequest('/api/auth/login'))
      const response = await middleware(req)
      expect(response.status).toBe(200)
    })

    it('should apply custom excludePaths', async () => {
      const customMiddleware = createAuthMiddleware({
        jwtService,
        excludePaths: ['/custom-exclude'],
      })
      const req = toNextRequest(createNextRequest('/custom-exclude'))
      const response = await customMiddleware(req)
      expect(response.status).toBe(200)
    })

    it('should protect non-excluded paths without auth', async () => {
      const req = toNextRequest(createNextRequest('/api/protected'))
      const response = await middleware(req)
      expect(response.status).toBe(401)
    })
  })

  describe('JWT validation', () => {
    it('should return 401 for missing Authorization header', async () => {
      const req = toNextRequest(createNextRequest('/api/protected'))
      const response = await middleware(req)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Missing or invalid Authorization header')
    })

    it('should return 401 for malformed Authorization header (no Bearer)', async () => {
      const req = toNextRequest(
        createNextRequest('/api/protected', 'Basic sometoken')
      )
      const response = await middleware(req)
      expect(response.status).toBe(401)
    })

    it('should return 401 for malformed JWT', async () => {
      const req = toNextRequest(
        createNextRequest('/api/protected', 'Bearer not-a-valid-jwt')
      )
      const response = await middleware(req)
      expect(response.status).toBe(401)
    })

    it('should return 401 for expired JWT', async () => {
      const expiredToken = await jwtService.sign(
        {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'viewer',
          sessionId: 'session-1',
          generation: 0,
        },
        -1000 // expired 1 second ago
      )
      const req = toNextRequest(
        createNextRequest('/api/protected', `Bearer ${expiredToken}`)
      )
      const response = await middleware(req)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Token expired')
    })

    it('should return 401 for invalid token signature', async () => {
      const badJwtService = new JwtService('wrong-secret')
      const badToken = await badJwtService.signAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'viewer',
        sessionId: 'session-1',
        generation: 0,
      })
      const req = toNextRequest(
        createNextRequest('/api/protected', `Bearer ${badToken}`)
      )
      const response = await middleware(req)
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.error).toBe('Invalid token signature')
    })

    it('should pass valid JWT and attach user headers', async () => {
      const token = await jwtService.signAccessToken({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'editor',
        sessionId: 'session-1',
        generation: 0,
      })
      const req = toNextRequest(
        createNextRequest('/api/protected', `Bearer ${token}`)
      )
      const response = await middleware(req)
      expect(response.status).toBe(200)
      expect(response.headers.get('x-user-id')).toBe('user-123')
      expect(response.headers.get('x-user-email')).toBe('test@example.com')
      expect(response.headers.get('x-user-role')).toBe('editor')
    })
  })
})
