import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './user'
import type { User, CreateUserInput, UserFilter } from './user'

describe('models/user', () => {
  describe('type definitions', () => {
    it('should have correct User interface fields', () => {
      const user: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'somehash',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(user.id).toBe('123')
      expect(user.email).toBe('test@example.com')
      expect(user.passwordHash).toBe('somehash')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should accept CreateUserInput with email and password', () => {
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'Password123!',
      }
      expect(input.email).toBe('test@example.com')
      expect(input.password).toBe('Password123!')
    })

    it('should accept UserFilter with optional email', () => {
      const filter: UserFilter = {}
      expect(filter.email).toBeUndefined()

      const filterWithEmail: UserFilter = { email: 'test@example.com' }
      expect(filterWithEmail.email).toBe('test@example.com')
    })
  })

  describe('hashPassword', () => {
    it('should produce a hash and salt', async () => {
      const { hash, salt } = await hashPassword('Password123!')
      expect(hash).toBeDefined()
      expect(salt).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(typeof salt).toBe('string')
    })

    it('should produce different hashes for the same password (due to random salt)', async () => {
      const password = 'Password123!'
      const result1 = await hashPassword(password)
      const result2 = await hashPassword(password)

      expect(result1.hash).not.toBe(result2.hash)
      expect(result1.salt).not.toBe(result2.salt)
    })

    it('should produce hashes of consistent length', async () => {
      const password = 'Password123!'
      const result1 = await hashPassword(password)
      const result2 = await hashPassword(password)

      // PBKDF2 with 512 bytes = 1024 hex characters (512 * 2)
      expect(result1.hash.length).toBe(1024)
      expect(result2.hash.length).toBe(1024)
    })

    it('should verify correct password against its own hash', async () => {
      const password = 'Password123!'
      const { hash, salt } = await hashPassword(password)

      const isValid = await verifyPassword(password, hash, salt)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'Password123!'
      const wrongPassword = 'WrongPassword!'
      const { hash, salt } = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hash, salt)
      expect(isValid).toBe(false)
    })

    it('should produce non-empty hash and salt', async () => {
      const { hash, salt } = await hashPassword('Password123!')
      expect(hash.length).toBeGreaterThan(0)
      expect(salt.length).toBeGreaterThan(0)
    })
  })

  describe('integration: user creation with hashed password', () => {
    it('should never store plain text password', async () => {
      const password = 'MySecurePassword123!'
      const { hash, salt } = await hashPassword(password)

      // Verify the hash is not the plain text password
      expect(hash).not.toBe(password)
      expect(salt).not.toBe(password)

      // Verify we can still authenticate with the hash
      const isValid = await verifyPassword(password, hash, salt)
      expect(isValid).toBe(true)
    })

    it('should allow creating multiple users with same password but different hashes', async () => {
      const password = 'SharedPassword123!'

      const user1 = await hashPassword(password)
      const user2 = await hashPassword(password)

      // Each user should have a unique hash
      expect(user1.hash).not.toBe(user2.hash)
      expect(user1.salt).not.toBe(user2.salt)

      // But both should verify correctly
      expect(await verifyPassword(password, user1.hash, user1.salt)).toBe(true)
      expect(await verifyPassword(password, user2.hash, user2.salt)).toBe(true)
    })
  })
})
