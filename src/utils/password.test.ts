import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password utility', () => {
  describe('hashPassword', () => {
    it('produces different output each time', async () => {
      const hash1 = await hashPassword('password123')
      const hash2 = await hashPassword('password123')
      expect(hash1).not.toBe(hash2)
    })

    it('contains salt:hash format', async () => {
      const hash = await hashPassword('password123')
      const idx = hash.indexOf(':')
      expect(idx).toBeGreaterThan(0)
      const salt = hash.slice(0, idx)
      expect(salt.length).toBe(64) // 32 bytes hex = 64 chars
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const hash = await hashPassword('CorrectPass1!')
      const result = await verifyPassword('CorrectPass1!', hash)
      expect(result).toBe(true)
    })

    it('returns false for wrong password', async () => {
      const hash = await hashPassword('CorrectPass1!')
      const result = await verifyPassword('WrongPass1!', hash)
      expect(result).toBe(false)
    })

    it('handles empty string', async () => {
      const hash = await hashPassword('')
      expect(await verifyPassword('', hash)).toBe(true)
      expect(await verifyPassword('something', hash)).toBe(false)
    })

    it('handles very long password', async () => {
      const longPass = 'a'.repeat(1000)
      const hash = await hashPassword(longPass)
      expect(await verifyPassword(longPass, hash)).toBe(true)
    })

    it('handles special characters', async () => {
      const special = 'p@$w0rd!#$%^&*()_+-=[]{}|;:\'",.<>?/`~'
      const hash = await hashPassword(special)
      expect(await verifyPassword(special, hash)).toBe(true)
    })

    it('returns false for malformed hash', async () => {
      expect(await verifyPassword('pass', 'no-colon-here')).toBe(false)
    })
  })
})
