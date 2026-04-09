import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isTokenExpired } from './token-utils'

// Helper to create a mock JWT with a given exp timestamp
function createMockToken(expTimestamp: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'viewer' as const,
      sessionId: 'sess-456',
      generation: 1,
      iat: Math.floor(Date.now() / 1000) - 60,
      exp: expTimestamp,
    })
  ).toString('base64url')
  // signature doesn't matter since we don't verify it
  return `${header}.${payload}.fake-signature`
}

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00Z'))
  })

  it('returns false for a valid token with exp in the future', () => {
    const futureExp = Math.floor(new Date('2026-04-09T13:00:00Z').getTime() / 1000)
    const token = createMockToken(futureExp)

    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for an expired token with exp in the past', () => {
    const pastExp = Math.floor(new Date('2026-04-09T11:00:00Z').getTime() / 1000)
    const token = createMockToken(pastExp)

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for a token that expired 1 hour ago', () => {
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600
    const token = createMockToken(oneHourAgo)

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for a token that expires in 1 hour', () => {
    const oneHourLater = Math.floor(Date.now() / 1000) + 3600
    const token = createMockToken(oneHourLater)

    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a malformed token with invalid format', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
    expect(isTokenExpired('singlepart')).toBe(true)
  })

  it('returns true for a token with invalid base64 in payload', () => {
    const token = 'header.!!!invalidbase64.signature'
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for a token with valid format but invalid JSON payload', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const invalidPayload = Buffer.from('not-valid-json').toString('base64url')
    const token = `${header}.${invalidPayload}.signature`

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for a token missing exp claim', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const payloadNoExp = Buffer.from(
      JSON.stringify({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'viewer',
        sessionId: 'sess-456',
      })
    ).toString('base64url')
    const token = `${header}.${payloadNoExp}.signature`

    expect(isTokenExpired(token)).toBe(true)
  })
})