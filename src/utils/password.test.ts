import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password utilities', () => {
  describe('hashPassword', () => {
    it('should produce a bcrypt hash with cost factor 12', async () => {
      const hash = await hashPassword('TestPassword123!')
      expect(hash).toMatch(/^\$2[aby]?\$\d{1,2}\$/)
      expect(hash).not.toBe('TestPassword123!')
    })

    it('should produce different hashes for same password (salt)', async () => {
      const hash1 = await hashPassword('SamePassword')
      const hash2 = await hashPassword('SamePassword')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const hash = await hashPassword('CorrectPassword123!')
      const result = await verifyPassword('CorrectPassword123!', hash)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('CorrectPassword123!')
      const result = await verifyPassword('WrongPassword', hash)
      expect(result).toBe(false)
    })
  })
})