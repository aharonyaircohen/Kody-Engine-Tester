import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for invalid token format (not enough parts)', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true)
    expect(isTokenExpired('only.two')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })

  it('returns true for expired token', () => {
    // Manually craft a token with exp in the past
    // JWT format: header.payload.signature
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    const payload = Buffer.from(JSON.stringify({ userId: '123', exp: pastExp })).toString('base64url')
    const token = `${header}.${payload}.fake-signature`

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for non-expired token', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    const payload = Buffer.from(JSON.stringify({ userId: '123', exp: futureExp })).toString('base64url')
    const token = `${header}.${payload}.fake-signature`

    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for token that just expired', () => {
    vi.setSystemTime(new Date('2026-04-10T12:00:00Z'))

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const exp = Math.floor(Date.now() / 1000) - 1 // 1 second ago
    const payload = Buffer.from(JSON.stringify({ userId: '123', exp })).toString('base64url')
    const token = `${header}.${payload}.fake-signature`

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for malformed payload (invalid JSON)', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const invalidPayload = Buffer.from('not-json').toString('base64url')
    const token = `${header}.${invalidPayload}.fake-signature`

    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for token missing exp claim', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ userId: '123' })).toString('base64url') // no exp
    const token = `${header}.${payload}.fake-signature`

    expect(isTokenExpired(token)).toBe(true)
  })
})