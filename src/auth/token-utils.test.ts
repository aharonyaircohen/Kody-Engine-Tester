import { describe, it, expect, beforeEach } from 'vitest'
import { JwtService } from './jwt-service'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  let service: JwtService

  beforeEach(() => {
    service = new JwtService('test-secret-key')
  })

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    sessionId: 'session-1',
    generation: 0,
  }

  it('should return false for a valid non-expired token', async () => {
    const token = await service.signAccessToken(basePayload)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('should return true for an expired token', async () => {
    const token = await service.sign(basePayload, -1000) // already expired
    expect(isTokenExpired(token)).toBe(true)
  })

  it('should return true for a token that expires in the future', async () => {
    const token = await service.signRefreshToken(basePayload)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('should return true for an invalid token format', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
    expect(isTokenExpired('too.many.parts.here')).toBe(true)
  })

  it('should return true for a malformed token', () => {
    expect(isTokenExpired('invalid!!!token')).toBe(true)
    expect(isTokenExpired('a.b')).toBe(true)
  })

  it('should handle tokens with missing exp claim in payload', async () => {
    // Create a token manually without exp claim
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify({ userId: 'test' })).toString('base64url')
    const token = `${header}.${body}.signature`
    expect(isTokenExpired(token)).toBe(true)
  })
})