import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, validateUserSchema, createUser } from './user'

// Helper type for error result to avoid TypeScript narrowing issues
type ValidationError = { valid: false; error: string }

describe('User model', () => {
  describe('password hashing', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword('testPassword123')
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
      expect(hash).not.toBe('testPassword123')
    })

    it('should produce different hashes for the same password (salted)', async () => {
      const hash1 = await hashPassword('samePassword')
      const hash2 = await hashPassword('samePassword')
      expect(hash1).not.toBe(hash2)
    })

    it('should verify correct password', async () => {
      const password = 'MySecurePassword123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'MySecurePassword123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('wrongPassword', hash)
      expect(isValid).toBe(false)
    })

    it('should reject password with different case', async () => {
      const password = 'MySecurePassword123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('mysecurepassword123', hash)
      expect(isValid).toBe(false)
    })

    it('should handle empty string password', async () => {
      const hash = await hashPassword('')
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(true)
    })

    it('should handle unicode characters', async () => {
      const password = 'пароль密码🔐'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })
  })

  describe('schema validation', () => {
    it('should validate a complete user object', () => {
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.user).toEqual(user)
      }
    })

    it('should reject null', () => {
      const result = validateUserSchema(null)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('User must be an object')
    })

    it('should reject non-object types', () => {
      expect(validateUserSchema('string').valid).toBe(false)
      expect(validateUserSchema(123).valid).toBe(false)
      expect(validateUserSchema(undefined).valid).toBe(false)
    })

    it('should reject missing id', () => {
      const user = {
        email: 'test@example.com',
        passwordHash: 'hash123',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('id must be a non-empty string')
    })

    it('should reject empty id', () => {
      const user = {
        id: '',
        email: 'test@example.com',
        passwordHash: 'hash123',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('id must be a non-empty string')
    })

    it('should reject missing email', () => {
      const user = {
        id: '123',
        passwordHash: 'hash123',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('email must be a non-empty string')
    })

    it('should reject empty email', () => {
      const user = {
        id: '123',
        email: '',
        passwordHash: 'hash123',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('email must be a non-empty string')
    })

    it('should reject missing passwordHash', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('passwordHash must be a non-empty string')
    })

    it('should reject empty passwordHash', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('passwordHash must be a non-empty string')
    })

    it('should reject non-string id', () => {
      const user = {
        id: 123,
        email: 'test@example.com',
        passwordHash: 'hash123',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('id must be a non-empty string')
    })

    it('should reject non-string email', () => {
      const user = {
        id: '123',
        email: 123,
        passwordHash: 'hash123',
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('email must be a non-empty string')
    })

    it('should reject non-string passwordHash', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 123,
      }
      const result = validateUserSchema(user)
      expect(result.valid).toBe(false)
      expect((result as ValidationError).error).toBe('passwordHash must be a non-empty string')
    })
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const existingEmails = new Set<string>()
      const user = await createUser({ email: 'new@example.com', password: 'Password123!' }, existingEmails)

      expect(user.id).toBeDefined()
      expect(user.email).toBe('new@example.com')
      expect(user.passwordHash).not.toBe('Password123!')
      expect(user.passwordHash).toMatch(/^\$2b\$/)
    })

    it('should throw on missing email', async () => {
      const existingEmails = new Set<string>()
      await expect(createUser({ email: '', password: 'Password123!' }, existingEmails))
        .rejects.toThrow('Email is required')
    })

    it('should throw on missing password', async () => {
      const existingEmails = new Set<string>()
      await expect(createUser({ email: 'test@example.com', password: '' }, existingEmails))
        .rejects.toThrow('Password is required')
    })

    it('should throw on duplicate email', async () => {
      const existingEmails = new Set<string>(['existing@example.com'])
      await expect(createUser({ email: 'existing@example.com', password: 'Password123!' }, existingEmails))
        .rejects.toThrow('Email already exists')
    })

    it('should add email to existingEmails set', async () => {
      const existingEmails = new Set<string>()
      await createUser({ email: 'new@example.com', password: 'Password123!' }, existingEmails)
      expect(existingEmails.has('new@example.com')).toBe(true)
    })

    it('should verify created user password', async () => {
      const existingEmails = new Set<string>()
      const user = await createUser({ email: 'test@example.com', password: 'CorrectPassword' }, existingEmails)
      const isValid = await verifyPassword('CorrectPassword', user.passwordHash)
      expect(isValid).toBe(true)
    })
  })
})
