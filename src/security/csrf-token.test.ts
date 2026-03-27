import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { CsrfTokenService } from './csrf-token'

describe('CsrfTokenService', () => {
  let service: CsrfTokenService

  beforeEach(() => {
    service = new CsrfTokenService({ ttlMs: 30 * 60 * 1000 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('generate', () => {
    it('should generate a 64-character hex token', async () => {
      const token = await service.generate('session-1')
      expect(token).toHaveLength(64)
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true)
    })

    it('should generate unique tokens each time', async () => {
      const t1 = await service.generate('session-1')
      const t2 = await service.generate('session-1')
      expect(t1).not.toBe(t2)
    })

    it('should store token for the given session', async () => {
      const token = await service.generate('session-1')
      const result = await service.validate('session-1', token)
      expect(result.valid).toBe(true)
    })

    it('should overwrite existing token for same session', async () => {
      const t1 = await service.generate('session-1')
      const t2 = await service.generate('session-1')
      const result = await service.validate('session-1', t1)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid CSRF token')
    })
  })

  describe('validate', () => {
    it('should return valid for correct token', async () => {
      const token = await service.generate('session-1')
      const result = await service.validate('session-1', token)
      expect(result.valid).toBe(true)
    })

    it('should return error for unknown session', async () => {
      const result = await service.validate('unknown-session', 'any-token')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CSRF token not found')
    })

    it('should return error for wrong token', async () => {
      await service.generate('session-1')
      const result = await service.validate('session-1', 'wrong-token')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid CSRF token')
    })

    it('should return newToken on successful validation (rotation)', async () => {
      const token = await service.generate('session-1')
      const result = await service.validate('session-1', token)
      expect(result.valid).toBe(true)
      expect(result.newToken).toBeDefined()
      expect(result.newToken).toHaveLength(64)
      expect(result.newToken).not.toBe(token)
    })

    it('should return error for expired token', async () => {
      vi.useFakeTimers()
      const shortTtl = new CsrfTokenService({ ttlMs: 1000 })
      const token = await shortTtl.generate('session-1')

      vi.advanceTimersByTime(1001)
      const result = await shortTtl.validate('session-1', token)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CSRF token expired')
    })
  })

  describe('single-use', () => {
    it('should delete token after first validation', async () => {
      const token = await service.generate('session-1')
      await service.validate('session-1', token)
      const result = await service.validate('session-1', token)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid CSRF token')
    })

    it('should allow new token to be validated after rotation', async () => {
      const token = await service.generate('session-1')
      const result = await service.validate('session-1', token)
      expect(result.valid).toBe(true)
      expect(result.newToken).toBeDefined()
      const second = await service.validate('session-1', result.newToken!)
      expect(second.valid).toBe(true)
    })
  })

  describe('token rotation', () => {
    it('should rotate token on each validation', async () => {
      const t1 = await service.generate('session-1')
      const r1 = await service.validate('session-1', t1)
      const r2 = await service.validate('session-1', r1.newToken!)
      const r3 = await service.validate('session-1', r2.newToken!)

      expect(r1.newToken).not.toBe(t1)
      expect(r2.newToken).not.toBe(r1.newToken)
      expect(r3.newToken).not.toBe(r2.newToken)
    })

    it('should not allow reuse of old rotated tokens', async () => {
      const t1 = await service.generate('session-1')
      const r1 = await service.validate('session-1', t1)
      await service.validate('session-1', r1.newToken!)
      const result = await service.validate('session-1', t1)
      expect(result.valid).toBe(false)
    })
  })

  describe('revoke', () => {
    it('should remove token for session', async () => {
      const token = await service.generate('session-1')
      service.revoke('session-1')
      const result = await service.validate('session-1', token)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CSRF token not found')
    })
  })

  describe('cleanup', () => {
    it('should remove expired tokens from store', async () => {
      vi.useFakeTimers()
      const shortTtl = new CsrfTokenService({ ttlMs: 1000 })
      await shortTtl.generate('session-1')
      vi.advanceTimersByTime(1001)
      shortTtl.cleanup()
      expect(shortTtl.size).toBe(0)
    })

    it('should preserve non-expired tokens during cleanup', async () => {
      vi.useFakeTimers()
      const shortTtl = new CsrfTokenService({ ttlMs: 1000 })
      const token = await shortTtl.generate('session-1')
      vi.advanceTimersByTime(500)
      shortTtl.cleanup()
      expect(shortTtl.size).toBe(1)
      const result = await shortTtl.validate('session-1', token)
      expect(result.valid).toBe(true)
    })
  })

  describe('size', () => {
    it('should track number of active tokens', async () => {
      expect(service.size).toBe(0)
      await service.generate('session-1')
      expect(service.size).toBe(1)
      await service.generate('session-2')
      expect(service.size).toBe(2)
      service.revoke('session-1')
      expect(service.size).toBe(1)
    })
  })
})
