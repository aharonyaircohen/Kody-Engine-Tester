import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for an expired token', () => {
    // Create a token that expired in the past (exp = 0, which is Jan 1, 1970)
    const expiredPayload = { exp: 0 }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url')
    const expiredToken = `${header}.${body}.signature`

    expect(isTokenExpired(expiredToken)).toBe(true)
  })

  it('returns false for a valid token with future exp', () => {
    // Set exp to 1 hour in the future
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const validPayload = { exp: futureExp }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(validPayload)).toString('base64url')
    const validToken = `${header}.${body}.signature`

    expect(isTokenExpired(validToken)).toBe(false)
  })

  it('returns true for a malformed token', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
  })

  it('returns true for a token with invalid base64 in payload', () => {
    expect(isTokenExpired('header.invalid!!!base64.signature')).toBe(true)
  })

  it('handles token that expires in exactly 1 second', () => {
    const now = Math.floor(Date.now() / 1000)
    const payload = { exp: now + 1 }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const token = `${header}.${body}.signature`

    // Should not be expired yet
    expect(isTokenExpired(token)).toBe(false)

    // Advance time by 2 seconds - now it should be expired
    vi.advanceTimersByTime(2000)
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for token missing exp claim', () => {
    const payloadWithoutExp = { userId: '123' }
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(payloadWithoutExp)).toString('base64url')
    const token = `${header}.${body}.signature`

    expect(isTokenExpired(token)).toBe(true)
  })
})