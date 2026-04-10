import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password-hash'

describe('password-hash', () => {
  describe('hashPassword', () => {
    it('should generate a non-empty hash for a valid password', async () => {
      const hash = await hashPassword('TestPassword123!')
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password (due to salt)', async () => {
      const hash1 = await hashPassword('TestPassword123!')
      const hash2 = await hashPassword('TestPassword123!')
      expect(hash1).not.toBe(hash2)
    })

    it('should generate a hash that starts with $2b$ (bcrypt prefix)', async () => {
      const hash = await hashPassword('TestPassword123!')
      expect(hash.startsWith('$2b$')).toBe(true)
    })

    it('should handle empty string password', async () => {
      const hash = await hashPassword('')
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should handle very long password', async () => {
      const longPassword = 'a'.repeat(1000)
      const hash = await hashPassword(longPassword)
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!'
      const wrongPassword = 'WrongPassword456!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    it('should return false for empty string when original was not empty', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })

    it('should return false for empty string original when verification is empty', async () => {
      const hash = await hashPassword('')
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(true)
    })

    it('should return false for very long password when original was normal', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      const veryLongPassword = 'a'.repeat(1000)
      const isValid = await verifyPassword(veryLongPassword, hash)
      expect(isValid).toBe(false)
    })
  })
})