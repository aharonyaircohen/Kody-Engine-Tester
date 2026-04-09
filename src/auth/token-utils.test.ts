import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for invalid token format', () => {
    expect(isTokenExpired('invalid-token')).toBe(true)
    expect(isTokenExpired('not-a-jwt')).toBe(true)
    expect(isTokenExpired('')).toBe(true)
  })

  it('returns true for expired token', () => {
    // Create a token with exp in the past (1 hour ago)
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    const expiredToken = `header.${Buffer.from(JSON.stringify({ exp: pastExp })).toString('base64url')}.signature`

    expect(isTokenExpired(expiredToken)).toBe(true)
  })

  it('returns false for valid non-expired token', () => {
    // Create a token with exp in the future (1 hour from now)
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const validToken = `header.${Buffer.from(JSON.stringify({ exp: futureExp })).toString('base64url')}.signature`

    expect(isTokenExpired(validToken)).toBe(false)
  })

  it('returns true for token that just expired', () => {
    // Create a token that expired 1 second ago
    vi.setSystemTime(1000000000000)
    const pastExp = Math.floor(1000000000000 / 1000) - 1
    const expiredToken = `header.${Buffer.from(JSON.stringify({ exp: pastExp })).toString('base64url')}.signature`

    expect(isTokenExpired(expiredToken)).toBe(true)
  })

  it('returns false for token expiring in the future', () => {
    // Create a token that expires in 1 second
    vi.setSystemTime(1000000000000)
    const futureExp = Math.floor(1000000000000 / 1000) + 1
    const validToken = `header.${Buffer.from(JSON.stringify({ exp: futureExp })).toString('base64url')}.signature`

    expect(isTokenExpired(validToken)).toBe(false)
  })
})