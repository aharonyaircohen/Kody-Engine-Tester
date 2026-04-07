import { describe, it, expect, beforeAll } from 'vitest'
import { JwtService } from '@/auth/jwt-service'
import { requireRole } from '@/middleware/rbac'
import type { RbacRole } from '@/auth/auth-service'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'

let jwtService: JwtService

beforeAll(() => {
  jwtService = new JwtService(JWT_SECRET)
})

function makeRequest(token: string | null | undefined, method = 'GET'): NextRequest {
  const req = new NextRequest('http://localhost/api/test', { method })
  if (token != null) {
    req.headers.set('authorization', `Bearer ${token}`)
  }
  return req
}

async function createToken(role: RbacRole, expired = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = expired ? now - 3600 : now + 3600
  // Access the internal sign method to override exp
  const fullPayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role,
    sessionId: 'sess-1',
    generation: 0,
    iat: now,
    exp,
  }

  const encoder = new TextEncoder()
  const base64urlEncode = (data: string): string =>
    Buffer.from(data).toString('base64url')

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64urlEncode(JSON.stringify(fullPayload))
  const signingInput = `${header}.${body}`

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signingInput))
  const sig = Buffer.from(sigBuffer).toString('base64url')

  return `${signingInput}.${sig}`
}

describe('requireRole middleware', () => {
  it('allows request when user has required role (admin)', async () => {
    const token = await createToken('admin')
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-user-id')).toBe('user-1')
    expect(response.headers.get('x-user-role')).toBe('admin')
  })

  it('allows request when user has one of multiple allowed roles (editor)', async () => {
    const token = await createToken('editor')
    const middleware = requireRole('admin', 'editor')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-user-id')).toBe('user-1')
    expect(response.headers.get('x-user-role')).toBe('editor')
  })

  it('allows admin to access editor-protected route (hierarchical)', async () => {
    const token = await createToken('admin')
    const middleware = requireRole('editor')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200)
  })

  it('allows viewer to access viewer-protected route', async () => {
    const token = await createToken('viewer')
    const middleware = requireRole('viewer')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200)
  })

  it('returns 403 when user lacks required role', async () => {
    const token = await createToken('viewer')
    const middleware = requireRole('admin', 'editor')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toContain('Forbidden')
  })

  it('returns 401 when no token is provided', async () => {
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest(null))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Missing or invalid Authorization header')
  })

  it('returns 401 when token is invalid', async () => {
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest('invalid-token'))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Invalid token')
  })

  it('returns 401 when token is expired', async () => {
    const token = await createToken('admin', true)
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Token expired')
  })
})
