import { describe, it, expect } from 'vitest'
import { hash, verify } from './password'

describe('password hashing', () => {
  describe('hash', () => {
    it('produces non-plaintext output', async () => {
      const plaintext = 'mySecretPassword123'
      const result = await hash(plaintext)
      expect(result).not.toBe(plaintext)
      expect(result.length).toBeGreaterThan(plaintext.length)
    })

    it('produces different hashes for the same password', async () => {
      const plaintext = 'mySecretPassword123'
      const hash1 = await hash(plaintext)
      const hash2 = await hash(plaintext)
      expect(hash1).not.toBe(hash2)
    })

    it('produces a bcrypt hash with expected format', async () => {
      const plaintext = 'password'
      const result = await hash(plaintext)
      expect(result.startsWith('$2a$') || result.startsWith('$2b$')).toBe(true)
      expect(result.split('$').length).toBe(4)
    })
  })

  describe('verify', () => {
    it('returns true for correct password', async () => {
      const plaintext = 'mySecretPassword123'
      const hashed = await hash(plaintext)
      const result = await verify(plaintext, hashed)
      expect(result).toBe(true)
    })

    it('returns false for wrong password', async () => {
      const plaintext = 'mySecretPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashed = await hash(plaintext)
      const result = await verify(wrongPassword, hashed)
      expect(result).toBe(false)
    })

    it('returns false for empty password against valid hash', async () => {
      const plaintext = 'mySecretPassword123'
      const hashed = await hash(plaintext)
      const result = await verify('', hashed)
      expect(result).toBe(false)
    })

    it('handles special characters in password', async () => {
      const plaintext = 'p@$$w0rd!#$%^&*()_+-=[]{}|;:,.<>?'
      const hashed = await hash(plaintext)
      const result = await verify(plaintext, hashed)
      expect(result).toBe(true)
    })

    it('handles unicode characters in password', async () => {
      const plaintext = 'пароль密码パスワード🔐'
      const hashed = await hash(plaintext)
      const result = await verify(plaintext, hashed)
      expect(result).toBe(true)
    })
  })

  describe('hash is non-reversible', () => {
    it('cannot derive password from hash using verify with wrong password', async () => {
      const plaintext = 'mySecretPassword123'
      const hashed = await hash(plaintext)
      const result = await verify('definitelywrong', hashed)
      expect(result).toBe(false)
    })
  })
})