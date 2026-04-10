import { describe, it, expect } from 'vitest'
import {
  createUser,
  hashPassword,
  verifyPassword,
  validateEmailField,
  validatePasswordField,
  validateCreateUserInput,
  type CreateUserInput,
} from './user'

describe('User model', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for same password (due to salt)', async () => {
      const password = 'TestPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('WrongPassword123!', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('validateEmailField', () => {
    it('returns valid for valid email', () => {
      expect(validateEmailField('user@example.com')).toEqual({ valid: true })
      expect(validateEmailField('user.name+tag@domain.co.uk')).toEqual({ valid: true })
    })

    it('returns invalid for invalid email', () => {
      const result1 = validateEmailField('notanemail')
      expect(result1.valid).toBe(false)

      const result2 = validateEmailField('missing@')
      expect(result2.valid).toBe(false)

      const result3 = validateEmailField('@nodomain.com')
      expect(result3.valid).toBe(false)
    })

    it('returns invalid for empty email', () => {
      const result = validateEmailField('')
      expect(result.valid).toBe(false)
      expect((result as { valid: false; error: string }).error).toBe('This field is required')
    })
  })

  describe('validatePasswordField', () => {
    it('returns valid for valid password', () => {
      expect(validatePasswordField('Password123!')).toEqual({ valid: true })
      expect(validatePasswordField('LongerPassword123456!')).toEqual({ valid: true })
    })

    it('returns invalid for password too short', () => {
      const result = validatePasswordField('Pass1!')
      expect(result.valid).toBe(false)
      expect((result as { valid: false; error: string }).error).toBe('Must be at least 8 characters')
    })

    it('returns invalid for password too long', () => {
      const longPassword = 'P'.repeat(129) + '1!'
      const result = validatePasswordField(longPassword)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; error: string }).error).toBe('Must be at most 128 characters')
    })

    it('returns invalid for empty password', () => {
      const result = validatePasswordField('')
      expect(result.valid).toBe(false)
      expect((result as { valid: false; error: string }).error).toBe('This field is required')
    })
  })

  describe('validateCreateUserInput', () => {
    it('returns valid for valid input', () => {
      const input: CreateUserInput = { email: 'user@example.com', password: 'Password123!' }
      expect(validateCreateUserInput(input)).toEqual({ valid: true })
    })

    it('returns invalid for missing email', () => {
      const input = { password: 'Password123!' } as CreateUserInput
      const result = validateCreateUserInput(input)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; errors: Record<string, string> }).errors.email).toBe('This field is required')
    })

    it('returns invalid for invalid email format', () => {
      const input: CreateUserInput = { email: 'notanemail', password: 'Password123!' }
      const result = validateCreateUserInput(input)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; errors: Record<string, string> }).errors.email).toBe('Invalid email address')
    })

    it('returns invalid for missing password', () => {
      const input = { email: 'user@example.com' } as unknown as CreateUserInput
      const result = validateCreateUserInput(input)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; errors: Record<string, string> }).errors.password).toBe('This field is required')
    })

    it('returns invalid for password too short', () => {
      const input: CreateUserInput = { email: 'user@example.com', password: 'Pass1!' }
      const result = validateCreateUserInput(input)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; errors: Record<string, string> }).errors.password).toBe('Must be at least 8 characters')
    })

    it('returns multiple errors when both fields are invalid', () => {
      const input: CreateUserInput = { email: 'notanemail', password: 'short' }
      const result = validateCreateUserInput(input)
      expect(result.valid).toBe(false)
      const errors = (result as { valid: false; errors: Record<string, string> }).errors
      expect(errors.email).toBeDefined()
      expect(errors.password).toBeDefined()
    })

    it('returns invalid for null input', () => {
      const result = validateCreateUserInput(null)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; errors: Record<string, string> }).errors.general).toBe('Invalid input')
    })

    it('returns invalid for non-object input', () => {
      const result = validateCreateUserInput('string' as unknown)
      expect(result.valid).toBe(false)
      expect((result as { valid: false; errors: Record<string, string> }).errors.general).toBe('Invalid input')
    })
  })

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const user = await createUser({ email: 'new@example.com', password: 'Password123!' })
      expect(user.id).toBeDefined()
      expect(user.email).toBe('new@example.com')
      expect(user.passwordHash).not.toBe('Password123!')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a user with a valid bcrypt hash', async () => {
      const user = await createUser({ email: 'hash@example.com', password: 'Password123!' })
      const isValid = await verifyPassword('Password123!', user.passwordHash)
      expect(isValid).toBe(true)
    })

    it('should throw for invalid email', async () => {
      await expect(createUser({ email: 'notanemail', password: 'Password123!' }))
        .rejects.toThrow('Invalid email address')
    })

    it('should throw for invalid password', async () => {
      await expect(createUser({ email: 'user@example.com', password: 'short' }))
        .rejects.toThrow('Must be at least 8 characters')
    })
  })
})