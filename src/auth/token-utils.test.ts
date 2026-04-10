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

  it('should return true for a token expired in the past', async () => {
    const token = await service.sign(basePayload, -3600) // expired 1 hour ago
    expect(isTokenExpired(token)).toBe(true)
  })

  it('should return true for an invalid token format (no dots)', () => {
    expect(isTokenExpired('invalid-token')).toBe(true)
  })

  it('should return true for an invalid token format (only one dot)', () => {
    expect(isTokenExpired('header.payload')).toBe(true)
  })

  it('should return true for an invalid token format (empty parts)', () => {
    expect(isTokenExpired('..')).toBe(true)
  })

  it('should return true for a malformed token (invalid base64)', () => {
    expect(isTokenExpired('header.!!!invalid.payload')).toBe(true)
  })

  it('should return true for a token with invalid JSON payload', () => {
    // Create a token with valid base64url encoding but invalid JSON
    const invalidPayload = Buffer.from('not json', 'utf-8').toString('base64url')
    expect(isTokenExpired(`header.${invalidPayload}.signature`)).toBe(true)
  })

  it('should return true for a refresh token that is expired', async () => {
    const token = await service.signRefreshToken(basePayload)
    // Manually tamper with the exp claim to make it expired
    const parts = token.split('.')
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
    payload.exp = Math.floor(Date.now() / 1000) - 1000 // expired 1000 seconds ago
    parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const expiredToken = parts.join('.')
    expect(isTokenExpired(expiredToken)).toBe(true)
  })

  it('should return false for a token that expires in the future', async () => {
    const token = await service.sign(basePayload, 60 * 60 * 1000) // expires in 1 hour
    expect(isTokenExpired(token)).toBe(false)
  })

  it('should handle empty string', () => {
    expect(isTokenExpired('')).toBe(true)
  })

  it('should handle whitespace-only string', () => {
    expect(isTokenExpired('   ')).toBe(true)
  })
})