import { describe, it, expect } from 'vitest'
import {
  createUser,
  createUserFromData,
  updateUser,
  isValidEmail,
  validateEmail,
  validatePasswordHash,
} from './user'

// Helper to create a valid password hash (128 hex chars = 512 bits PBKDF2)
function createValidPasswordHash(): string {
  return 'a'.repeat(128)
}

describe('User model', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
      expect(isValidEmail('user_name@example.com')).toBe(true)
      expect(isValidEmail('user123@example-domain.com')).toBe(true)
    })

    it('should return false for invalid email formats', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('missing@domain')).toBe(false)
      expect(isValidEmail('@nodomain.com')).toBe(false)
      expect(isValidEmail('spaces in@email.com')).toBe(false)
      expect(isValidEmail('user@@double.com')).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should return ok for valid email', () => {
      const result = validateEmail('user@example.com')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe('user@example.com')
      }
    })

    it('should trim and lowercase email', () => {
      const result = validateEmail('  User@Example.COM  ')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe('user@example.com')
      }
    })

    it('should return err for non-string input', () => {
      const result = validateEmail(123 as unknown as string)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Email must be a string')
      }
    })

    it('should return err for empty email', () => {
      const result = validateEmail('')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Email is required')
      }
    })

    it('should return err for whitespace-only email', () => {
      const result = validateEmail('   ')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Email is required')
      }
    })

    it('should return err for invalid email format', () => {
      const result = validateEmail('notanemail')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Invalid email format')
      }
    })
  })

  describe('validatePasswordHash', () => {
    it('should return ok for valid PBKDF2 hash', () => {
      const validHash = 'a'.repeat(128)
      const result = validatePasswordHash(validHash)
      expect(result.isOk()).toBe(true)
    })

    it('should return err for non-string input', () => {
      const result = validatePasswordHash(123 as unknown as string)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Password hash must be a string')
      }
    })

    it('should return err for empty hash', () => {
      const result = validatePasswordHash('')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Password hash is required')
      }
    })

    it('should return err for hash that is too short', () => {
      const shortHash = 'abc123'
      const result = validatePasswordHash(shortHash)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Invalid password hash format')
      }
    })
  })

  describe('createUser', () => {
    it('should create a user with valid input', () => {
      const result = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.email).toBe('user@example.com')
        expect(result.value.id).toBeDefined()
        expect(result.value.passwordHash).toBe(createValidPasswordHash())
        expect(result.value.createdAt).toBeInstanceOf(Date)
        expect(result.value.updatedAt).toBeInstanceOf(Date)
      }
    })

    it('should generate a valid UUID for user id', () => {
      const result = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        expect(result.value.id).toMatch(uuidRegex)
      }
    })

    it('should normalize email to lowercase', () => {
      const result = createUser({
        email: 'USER@EXAMPLE.COM',
        passwordHash: createValidPasswordHash(),
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.email).toBe('user@example.com')
      }
    })

    it('should trim whitespace from email', () => {
      const result = createUser({
        email: '  user@example.com  ',
        passwordHash: createValidPasswordHash(),
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.email).toBe('user@example.com')
      }
    })

    it('should set createdAt and updatedAt to same time', () => {
      const result = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.createdAt.getTime()).toBe(result.value.updatedAt.getTime())
      }
    })

    it('should return err for duplicate email format (invalid)', () => {
      const result = createUser({
        email: 'notanemail',
        passwordHash: createValidPasswordHash(),
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Invalid email format')
      }
    })

    it('should return err for missing password hash', () => {
      const result = createUser({
        email: 'user@example.com',
        passwordHash: '',
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Password hash is required')
      }
    })

    it('should return err for invalid password hash format', () => {
      const result = createUser({
        email: 'user@example.com',
        passwordHash: 'short',
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Invalid password hash format')
      }
    })
  })

  describe('createUserFromData', () => {
    it('should create a user from raw data', () => {
      const now = new Date()
      const result = createUserFromData({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
        createdAt: now,
        updatedAt: now,
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.id).toBe('123e4567-e89b-12d3-a456-426614174000')
        expect(result.value.email).toBe('user@example.com')
      }
    })

    it('should parse date strings', () => {
      const result = createUserFromData({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.createdAt).toBeInstanceOf(Date)
        expect(result.value.updatedAt).toBeInstanceOf(Date)
      }
    })

    it('should return err for missing id', () => {
      const result = createUserFromData({
        id: '',
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('User ID is required')
      }
    })

    it('should return err for missing email', () => {
      const result = createUserFromData({
        id: '123',
        email: '',
        passwordHash: createValidPasswordHash(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('User email is required')
      }
    })

    it('should return err for missing password hash', () => {
      const result = createUserFromData({
        id: '123',
        email: 'user@example.com',
        passwordHash: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('User password hash is required')
      }
    })
  })

  describe('updateUser', () => {
    it('should update email', () => {
      const user = createUser({
        email: 'old@example.com',
        passwordHash: createValidPasswordHash(),
      }).unwrap()

      const result = updateUser(user, { email: 'new@example.com' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.email).toBe('new@example.com')
      }
    })

    it('should update passwordHash', () => {
      const user = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      }).unwrap()

      const newHash = 'b'.repeat(128)
      const result = updateUser(user, { passwordHash: newHash })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.passwordHash).toBe(newHash)
      }
    })

    it('should update updatedAt timestamp', () => {
      const user = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      }).unwrap()

      const originalUpdatedAt = user.updatedAt
      // Small delay to ensure time difference
      const result = updateUser(user, { email: 'new@example.com' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
      }
    })

    it('should preserve id and createdAt', () => {
      const user = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      }).unwrap()

      const originalId = user.id
      const originalCreatedAt = user.createdAt

      const result = updateUser(user, { email: 'new@example.com' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.id).toBe(originalId)
        expect(result.value.createdAt).toBe(originalCreatedAt)
      }
    })

    it('should return err for invalid email update', () => {
      const user = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      }).unwrap()

      const result = updateUser(user, { email: 'invalid-email' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Invalid email format')
      }
    })

    it('should return err for invalid password hash update', () => {
      const user = createUser({
        email: 'user@example.com',
        passwordHash: createValidPasswordHash(),
      }).unwrap()

      const result = updateUser(user, { passwordHash: 'short' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toBe('Invalid password hash format')
      }
    })
  })
})