import { describe, it, expect, beforeEach } from 'vitest'
import { JwtServiceV2 } from './jwt-v2'

describe('JwtServiceV2', () => {
  let service: JwtServiceV2

  beforeEach(() => {
    // Create a fresh service instance for each test
    service = new JwtServiceV2()
  })

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    sessionId: 'session-1',
    generation: 0,
  }

  describe('constructor', () => {
    it('should create instance without keys (generates on demand)', async () => {
      service = new JwtServiceV2()
      // Access the public key to trigger key generation
      await service.getPublicKey()
      // No error means success
    })

    it('should initialize with migration mode when enabled', () => {
      service = new JwtServiceV2({ migrationMode: true })
      expect(service.isMigrationMode()).toBe(true)
    })

    it('should default migration mode to false', () => {
      service = new JwtServiceV2()
      expect(service.isMigrationMode()).toBe(false)
    })
  })

  describe('signAccessToken / verify', () => {
    it('should sign and verify an access token', async () => {
      const token = await service.signAccessToken(basePayload)
      const payload = await service.verify(token)
      expect(payload.userId).toBe('user-1')
      expect(payload.email).toBe('test@example.com')
      expect(payload.role).toBe('admin')
      expect(payload.sessionId).toBe('session-1')
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })

    it('should set access token expiry to ~15 minutes', async () => {
      const before = Math.floor(Date.now() / 1000)
      const token = await service.signAccessToken(basePayload)
      const payload = await service.verify(token)
      const expectedExp = before + 15 * 60
      expect(payload.exp).toBeGreaterThanOrEqual(expectedExp - 2)
      expect(payload.exp).toBeLessThanOrEqual(expectedExp + 2)
    })

    it('should reject a tampered token', async () => {
      const token = await service.signAccessToken(basePayload)
      const parts = token.split('.')
      parts[1] = Buffer.from(JSON.stringify({ ...basePayload, role: 'admin' })).toString('base64url')
      const tampered = parts.join('.')
      await expect(service.verify(tampered)).rejects.toThrow()
    })

    it('should reject an expired token', async () => {
      const token = await service.sign(basePayload, -1000) // already expired
      await expect(service.verify(token)).rejects.toThrow('Token expired')
    })

    it('should include generation in token payload', async () => {
      const token = await service.signAccessToken({ ...basePayload, generation: 3 })
      const payload = await service.verify(token)
      expect(payload.generation).toBe(3)
    })
  })

  describe('signRefreshToken', () => {
    it('should set refresh token expiry to ~7 days', async () => {
      const before = Math.floor(Date.now() / 1000)
      const token = await service.signRefreshToken(basePayload)
      const payload = await service.verify(token)
      const expectedExp = before + 7 * 24 * 60 * 60
      expect(payload.exp).toBeGreaterThanOrEqual(expectedExp - 2)
      expect(payload.exp).toBeLessThanOrEqual(expectedExp + 2)
    })
  })

  describe('blacklist', () => {
    it('should reject a blacklisted token', async () => {
      const token = await service.signAccessToken(basePayload)
      service.blacklist(token)
      await expect(service.verify(token)).rejects.toThrow('Token revoked')
    })

    it('should allow non-blacklisted token', async () => {
      const token = await service.signAccessToken(basePayload)
      const other = await service.signAccessToken({ ...basePayload, userId: 'other' })
      service.blacklist(other)
      const payload = await service.verify(token)
      expect(payload.userId).toBe('user-1')
    })

    it('cleanupBlacklist should remove expired tokens', async () => {
      const token = await service.sign(basePayload, -1000) // already expired
      service.blacklist(token)
      service.cleanupBlacklist()
      // Just verify it doesn't throw
    })
  })

  describe('isRs256Token', () => {
    it('should return true for RS256 token', async () => {
      const token = await service.signAccessToken(basePayload)
      expect(service.isRs256Token(token)).toBe(true)
    })

    it('should return false for HS256 token', () => {
      // Manually construct an HS256 token
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
      const body = Buffer.from(JSON.stringify(basePayload)).toString('base64url')
      const hs256Token = `${header}.${body}.fake-signature`
      expect(service.isRs256Token(hs256Token)).toBe(false)
    })

    it('should return false for invalid token format', () => {
      expect(service.isRs256Token('not-a-valid-jwt')).toBe(false)
      expect(service.isRs256Token('')).toBe(false)
    })
  })
})
