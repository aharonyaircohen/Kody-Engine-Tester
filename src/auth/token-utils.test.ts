import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isTokenExpired } from './token-utils'

// Helper to create a mock JWT with given exp (in seconds from now)
function createMockToken(expOffsetSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const payload = Buffer.from(
    JSON.stringify({
      userId: 'test-user',
      email: 'test@example.com',
      role: 'viewer',
      sessionId: 'test-session',
      generation: 1,
      iat: now,
      exp: now + expOffsetSeconds,
    })
  ).toString('base64url')
  // Invalid signature but we don't verify it for isTokenExpired
  return `${header}.${payload}.invalid-signature`
}

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for an expired token', () => {
    const expiredToken = createMockToken(-3600) // expired 1 hour ago
    expect(isTokenExpired(expiredToken)).toBe(true)
  })

  it('returns false for a valid token with future expiry', () => {
    const validToken = createMockToken(3600) // expires in 1 hour
    expect(isTokenExpired(validToken)).toBe(false)
  })

  it('returns false for a token that expires in 0 seconds (just at expiry boundary)', () => {
    // Token that expires exactly now - we treat as not expired since exp < now means expired
    const tokenAtExpiry = createMockToken(0)
    expect(isTokenExpired(tokenAtExpiry)).toBe(false)
  })

  it('returns true for a token that expired 1 second ago', () => {
    const tokenExpiredOneSecondAgo = createMockToken(-1)
    expect(isTokenExpired(tokenExpiredOneSecondAgo)).toBe(true)
  })

  it('returns true for a malformed token (not enough parts)', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })

  it('returns true for a token with invalid base64 in payload', () => {
    expect(isTokenExpired('header.!!!invalid.payload')).toBe(true)
  })

  it('handles tokens that were just issued with a short expiry window', () => {
    const freshToken = createMockToken(60) // expires in 60 seconds
    expect(isTokenExpired(freshToken)).toBe(false)
  })

  it('handles tokens with very long expiry windows', () => {
    const longLivedToken = createMockToken(30 * 24 * 60 * 60) // 30 days
    expect(isTokenExpired(longLivedToken)).toBe(false)
  })
})