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

  it('returns false for a valid non-expired token', async () => {
    const token = await service.signAccessToken(basePayload)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for an expired token', async () => {
    const token = await service.sign(basePayload, -1000) // already expired
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for a malformed token', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
  })

  it('returns true for a token with missing exp claim', async () => {
    // Create a token manually without exp
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify({ userId: 'user-1' })).toString('base64url')
    const token = `${header}.${body}.fake`
    expect(isTokenExpired(token)).toBe(true)
  })
})