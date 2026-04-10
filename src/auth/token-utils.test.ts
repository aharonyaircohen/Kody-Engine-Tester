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
    const now = Math.floor(Date.now() / 1000)
    const expiredPayload = { exp: now - 3600 } // expired 1 hour ago
    const token = `header.${Buffer.from(JSON.stringify(expiredPayload)).toString('base64url')}.signature`

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for a non-expired token', () => {
    const now = Math.floor(Date.now() / 1000)
    const validPayload = { exp: now + 3600 } // expires in 1 hour
    const token = `header.${Buffer.from(JSON.stringify(validPayload)).toString('base64url')}.signature`

    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns false for a token that expires exactly now', () => {
    const now = Math.floor(Date.now() / 1000)
    const boundaryPayload = { exp: now }
    const token = `header.${Buffer.from(JSON.stringify(boundaryPayload)).toString('base64url')}.signature`

    // At exactly exp time, token is still valid (exp < now is the check)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a token with invalid format (not 3 parts)', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('only-two-parts.here')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })

  it('returns true for a token with invalid base64 in payload', () => {
    expect(isTokenExpired('header.!!!invalid-base64!!!.signature')).toBe(true)
  })

  it('returns false for a token without exp claim', () => {
    const payloadWithoutExp = { userId: 'user-1', email: 'test@example.com' }
    const token = `header.${Buffer.from(JSON.stringify(payloadWithoutExp)).toString('base64url')}.signature`

    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a token with malformed JSON in payload', () => {
    const malformedBase64 = Buffer.from('not-json').toString('base64url')
    const token = `header.${malformedBase64}.signature`

    expect(isTokenExpired(token)).toBe(true)
  })
})