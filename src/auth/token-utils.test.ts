import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  const frozenNow = new Date('2026-04-10T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(frozenNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return true for an expired token', () => {
    const now = Math.floor(frozenNow.getTime() / 1000)
    const expiredPayload = {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
      iat: now - 3600, // 1 hour ago
      exp: now - 1, // 1 second ago - expired
    }
    const token = [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify(expiredPayload)).toString('base64url'),
      'signature',
    ].join('.')

    expect(isTokenExpired(token)).toBe(true)
  })

  it('should return false for a valid token with future exp', () => {
    const now = Math.floor(frozenNow.getTime() / 1000)
    const validPayload = {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      sessionId: 'session-1',
      generation: 0,
      iat: now,
      exp: now + 3600, // 1 hour in future
    }
    const token = [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify(validPayload)).toString('base64url'),
      'signature',
    ].join('.')

    expect(isTokenExpired(token)).toBe(false)
  })

  it('should return true for a malformed token (wrong number of parts)', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
    expect(isTokenExpired('too.many.parts.here')).toBe(true)
  })

  it('should return true for a token with invalid base64 in payload', () => {
    expect(isTokenExpired('header.invalid!!!base64.signature')).toBe(true)
  })

  it('should return true for an empty string', () => {
    expect(isTokenExpired('')).toBe(true)
  })

  it('should return true for a token with missing exp claim', () => {
    const payloadWithoutExp = {
      userId: 'user-1',
      email: 'test@example.com',
    }
    const token = [
      Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify(payloadWithoutExp)).toString('base64url'),
      'signature',
    ].join('.')

    expect(isTokenExpired(token)).toBe(true)
  })
})
