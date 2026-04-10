import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password-hash'

describe('password-hash', () => {
  describe('hashPassword', () => {
    it('returns a hash result with non-empty hash', async () => {
      const result = await hashPassword('testPassword123')
      expect(result.hash).toBeDefined()
      expect(typeof result.hash).toBe('string')
      expect(result.hash.length).toBeGreaterThan(0)
    })

    it('generates different hashes for the same password (unique salts)', async () => {
      const password = 'samePassword'
      const result1 = await hashPassword(password)
      const result2 = await hashPassword(password)
      expect(result1.hash).not.toBe(result2.hash)
    })

    it('hash is longer than the original password', async () => {
      const password = 'short'
      const result = await hashPassword(password)
      expect(result.hash.length).toBeGreaterThan(password.length)
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const password = 'mySecurePassword123'
      const { hash } = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const password = 'mySecurePassword123'
      const { hash } = await hashPassword(password)
      const isValid = await verifyPassword('wrongPassword', hash)
      expect(isValid).toBe(false)
    })

    it('returns false for empty password when hash was created from non-empty', async () => {
      const password = 'mySecurePassword123'
      const { hash } = await hashPassword(password)
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })

    it('handles special characters in password', async () => {
      const password = 'p@$$w0rd!#%^&*()_+-=[]{}|;:,.<>?'
      const { hash } = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('returns false for empty hash', async () => {
      const isValid = await verifyPassword('anyPassword', '')
      expect(isValid).toBe(false)
    })
  })
})
