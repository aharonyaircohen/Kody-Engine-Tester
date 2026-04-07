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

  it('returns true for a token that expires in the past (manual payload)', () => {
    const expiredPayload = {
      ...basePayload,
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 1800, // expired 30 minutes ago
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for a token that expires in the future (manual payload)', () => {
    const futurePayload = {
      ...basePayload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(futurePayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for an invalid token format (not 3 parts)', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('only-two-parts.here')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
    expect(isTokenExpired('a.b.c.d')).toBe(true)
  })

  it('returns true for a malformed token that cannot be decoded', () => {
    const malformedToken = 'header.%Y%Z.signature'
    expect(isTokenExpired(malformedToken)).toBe(true)
  })

  it('returns true for a token with invalid JSON in payload', () => {
    const invalidJsonToken = 'header.invalid-json-payload.signature'
    expect(isTokenExpired(invalidJsonToken)).toBe(true)
  })

  it('returns true for a token with missing exp claim (manual payload)', () => {
    const noExpPayload = {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
      iat: Math.floor(Date.now() / 1000),
      // exp is intentionally missing
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(noExpPayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for a token with exp claim that is not a number', () => {
    const stringExpPayload = {
      ...basePayload,
      iat: Math.floor(Date.now() / 1000),
      exp: 'not-a-number', // exp should be a number
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(stringExpPayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    expect(isTokenExpired(token)).toBe(true)
  })

  it('handles a token that is valid but expires exactly now', () => {
    const now = Math.floor(Date.now() / 1000)
    const exactExpiryPayload = {
      ...basePayload,
      iat: now - 100,
      exp: now, // expires exactly now
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(exactExpiryPayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    // At the exact boundary, exp < now check means if exp === now, it's not yet expired
    // But due to timing, we test that it doesn't throw
    expect(isTokenExpired(token)).toBe(false)
  })

  it('correctly identifies a token that expired 1 second ago', () => {
    const oneSecondAgo = Math.floor(Date.now() / 1000) - 1
    const expiredPayload = {
      ...basePayload,
      iat: oneSecondAgo - 100,
      exp: oneSecondAgo,
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    expect(isTokenExpired(token)).toBe(true)
  })

  it('correctly identifies a token that expires in 1 second', () => {
    const oneSecondFuture = Math.floor(Date.now() / 1000) + 1
    const futurePayload = {
      ...basePayload,
      iat: Math.floor(Date.now() / 1000),
      exp: oneSecondFuture,
    }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(futurePayload)).toString('base64url')
    const token = `${header}.${body}.fake-signature`
    expect(isTokenExpired(token)).toBe(false)
  })
})