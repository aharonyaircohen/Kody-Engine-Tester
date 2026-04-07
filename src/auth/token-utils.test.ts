import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { JwtService } from './jwt-service'
import { isTokenExpired } from './token-utils'

describe('isTokenExpired', () => {
  let service: JwtService

  beforeEach(() => {
    service = new JwtService('test-secret-key')
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    sessionId: 'session-1',
    generation: 0,
  }

  describe('valid tokens', () => {
    it('should return false for a non-expired access token', async () => {
      const token = await service.signAccessToken(basePayload)
      expect(isTokenExpired(token)).toBe(false)
    })

    it('should return false for a non-expired refresh token', async () => {
      const token = await service.signRefreshToken(basePayload)
      expect(isTokenExpired(token)).toBe(false)
    })

    it('should return false for a token with expiry far in the future', async () => {
      const token = await service.sign(basePayload, 24 * 60 * 60 * 1000) // 24 hours
      expect(isTokenExpired(token)).toBe(false)
    })
  })

  describe('expired tokens', () => {
    it('should return true for an already expired token', async () => {
      const token = await service.sign(basePayload, -1000) // already expired
      expect(isTokenExpired(token)).toBe(true)
    })

    it('should return true after time advances past expiry', async () => {
      const token = await service.sign(basePayload, 60 * 1000) // expires in 60 seconds

      vi.advanceTimersByTime(61 * 1000)

      expect(isTokenExpired(token)).toBe(true)
    })

    it('should return true for a token that expired moments ago', async () => {
      const before = Math.floor(Date.now() / 1000)
      const token = await service.sign(basePayload, 1000) // expires in 1 second

      // Advance time past expiry
      vi.advanceTimersByTime(2000)

      expect(isTokenExpired(token)).toBe(true)
    })
  })

  describe('malformed tokens', () => {
    it('should return true for an empty string', () => {
      expect(isTokenExpired('')).toBe(true)
    })

    it('should return true for a token with only one part', () => {
      expect(isTokenExpired('header')).toBe(true)
    })

    it('should return true for a token with only two parts', () => {
      expect(isTokenExpired('header.payload')).toBe(true)
    })

    it('should return true for a token with more than three parts', () => {
      expect(isTokenExpired('a.b.c.d')).toBe(true)
    })

    it('should return true for a token with invalid base64 in payload', () => {
      expect(isTokenExpired('eyJhbGciOiJIUzI1NiJ9.invalid!!!base64.signature')).toBe(true)
    })

    it('should return true for a token with valid base64 but invalid JSON in payload', () => {
      const invalidPayload = Buffer.from('not json', 'utf-8').toString('base64url')
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }), 'utf-8').toString('base64url')
      const sig = Buffer.from('signature', 'utf-8').toString('base64url')
      expect(isTokenExpired(`${header}.${invalidPayload}.${sig}`)).toBe(true)
    })

    it('should return true for a token with missing exp claim', () => {
      const payloadWithoutExp = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'admin',
        sessionId: 'session-1',
        generation: 0,
      }
      const payload = Buffer.from(JSON.stringify(payloadWithoutExp), 'utf-8').toString('base64url')
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }), 'utf-8').toString('base64url')
      const sig = Buffer.from('signature', 'utf-8').toString('base64url')
      expect(isTokenExpired(`${header}.${payload}.${sig}`)).toBe(true)
    })

    it('should return true for a token with non-numeric exp claim', () => {
      const payloadWithStringExp = {
        userId: 'user-1',
        email: 'test@example.com',
        role: 'admin',
        sessionId: 'session-1',
        generation: 0,
        exp: 'not-a-number',
      }
      const payload = Buffer.from(JSON.stringify(payloadWithStringExp), 'utf-8').toString('base64url')
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }), 'utf-8').toString('base64url')
      const sig = Buffer.from('signature', 'utf-8').toString('base64url')
      expect(isTokenExpired(`${header}.${payload}.${sig}`)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should correctly identify a freshly created token as not expired', async () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

      const token = await service.sign(basePayload, 60 * 1000) // 60 seconds expiry

      expect(isTokenExpired(token)).toBe(false)
    })

    it('should correctly identify token expired after time advances past expiry', async () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

      // Token created at 00:00:00Z with 60 second expiry (expires at 00:01:00Z)
      const token = await service.sign(basePayload, 60 * 1000)

      // Advance 61 seconds so we're past expiry
      vi.advanceTimersByTime(61 * 1000)

      expect(isTokenExpired(token)).toBe(true)
    })
  })
})
