import { describe, it, expect } from 'vitest'
import { JwtService } from './jwt-service'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  const jwtService = new JwtService('test-secret')

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    sessionId: 'session-1',
    generation: 0,
  }

  it('should return false for a valid non-expired token', async () => {
    const token = await jwtService.signAccessToken(basePayload)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('should return true for an expired token', async () => {
    const token = await jwtService.sign(basePayload, -1000) // already expired
    expect(isTokenExpired(token)).toBe(true)
  })

  it('should return true for an invalid token format', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })

  it('should return true for a malformed token', () => {
    expect(isTokenExpired('abc.def.ghi')).toBe(true)
  })

  it('should return true for a token without exp claim', async () => {
    // Manually create a token without exp
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ userId: 'user-1' })).toString('base64url')
    const token = `${header}.${payload}.signature`
    expect(isTokenExpired(token)).toBe(true)
  })
})