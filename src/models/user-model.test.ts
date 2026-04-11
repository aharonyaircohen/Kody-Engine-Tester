import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, BCRYPT_COST_FACTOR, User, CreateUserInput, PasswordHash } from './user-model'

describe('user-model', () => {
  describe('hashPassword', () => {
    it('produces different hash for same input due to salt', async () => {
      const password = 'TestPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      expect(hash1.hash).not.toBe(hash2.hash)
      expect(hash1.salt).not.toBe(hash2.salt)
    })

    it('returns object with hash and salt properties', async () => {
      const result = await hashPassword('anypassword')
      expect(result).toHaveProperty('hash')
      expect(result).toHaveProperty('salt')
      expect(typeof result.hash).toBe('string')
      expect(typeof result.salt).toBe('string')
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct plaintext', async () => {
      const password = 'CorrectPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('returns false for incorrect plaintext', async () => {
      const password = 'CorrectPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('WrongPassword123!', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('BCRYPT_COST_FACTOR', () => {
    it('is at least 12', () => {
      expect(BCRYPT_COST_FACTOR).toBeGreaterThanOrEqual(12)
    })
  })

  describe('User interface', () => {
    it('has required fields', () => {
      const user: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: '$2b$12$hashedvalue',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(user.id).toBeDefined()
      expect(user.email).toBeDefined()
      expect(user.passwordHash).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('CreateUserInput interface', () => {
    it('has email and password fields', () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      }
      expect(input.email).toBe('test@example.com')
      expect(input.password).toBe('SecurePassword123!')
    })
  })

  describe('PasswordHash interface', () => {
    it('contains hash and salt strings', () => {
      const ph: PasswordHash = {
        hash: '$2b$12$somehashedvalue',
        salt: '$2b$12$somesaltvalue',
      }
      expect(typeof ph.hash).toBe('string')
      expect(typeof ph.salt).toBe('string')
    })
  })
})