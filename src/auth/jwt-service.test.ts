import { describe, it, expect, beforeEach } from 'vitest'
import crypto from 'crypto'
import { JwtService } from './jwt-service'

// Generate test key pair once
const TEST_KEYS = (() => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  return { privateKey, publicKey }
})()

// Helper to generate a different key pair
function generateKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  return { privateKey, publicKey }
}

describe('JwtService', () => {
  let service: JwtService

  beforeEach(() => {
    service = new JwtService(TEST_KEYS.privateKey, TEST_KEYS.publicKey)
  })

  const basePayload = {
    userId: 'user-1',
    email: 'test@example.com',
    role: 'admin' as const,
    sessionId: 'session-1',
    generation: 0,
  }

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

    it('should reject a token signed with different key', async () => {
      const otherKeys = generateKeyPair()
      const otherService = new JwtService(otherKeys.privateKey, otherKeys.publicKey)
      const token = await otherService.signAccessToken(basePayload)
      await expect(service.verify(token)).rejects.toThrow('Invalid token signature')
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

  describe('RS256 specifics', () => {
    it('should use RS256 algorithm in header', async () => {
      const token = await service.signAccessToken(basePayload)
      const [header] = token.split('.')
      const decoded = JSON.parse(Buffer.from(header, 'base64url').toString())
      expect(decoded.alg).toBe('RS256')
      expect(decoded.typ).toBe('JWT')
    })

    it('should throw when JWT_PUBLIC_KEY is not set', async () => {
      const serviceWithoutKeys = new JwtService()
      await expect(serviceWithoutKeys.verify('any.token.here')).rejects.toThrow('JWT_PUBLIC_KEY environment variable is not set')
    })

    it('should throw when JWT_PRIVATE_KEY is not set during sign', async () => {
      const serviceWithoutKeys = new JwtService()
      await expect(serviceWithoutKeys.signAccessToken(basePayload)).rejects.toThrow('JWT_PRIVATE_KEY environment variable is not set')
    })
  })
})