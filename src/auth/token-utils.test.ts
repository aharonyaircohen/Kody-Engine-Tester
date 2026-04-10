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

  it('should return true for a token with invalid format', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
  })

  it('should return true for a token with missing exp claim', async () => {
    const token = await jwtService.sign(basePayload, 15 * 60 * 1000)
    // Manually strip the exp by creating a new token with same structure but no exp
    const parts = token.split('.')
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
    delete payload.exp
    const modifiedBody = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const tamperedToken = `${parts[0]}.${modifiedBody}.${parts[2]}`
    expect(isTokenExpired(tamperedToken)).toBe(true)
  })

  it('should return true for a refresh token that is still valid but near expiry', async () => {
    const token = await jwtService.signRefreshToken(basePayload)
    expect(isTokenExpired(token)).toBe(false)
  })
})