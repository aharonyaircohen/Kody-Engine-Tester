import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  describe('valid passwords', () => {
    it('should return valid for password meeting all requirements', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should return valid for password with exactly 8 characters', () => {
      const result = validatePasswordStrength('Pass1234')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should return valid for password with special characters', () => {
      const result = validatePasswordStrength('Password1!')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should return valid for long password', () => {
      const result = validatePasswordStrength('MyVerySecurePassword123')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })
  })

  describe('too short', () => {
    it('should return invalid for empty string', () => {
      const result = validatePasswordStrength('')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters long')
    })

    it('should return invalid for 7 characters', () => {
      const result = validatePasswordStrength('Pass1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters long')
    })

    it('should return invalid for 1 character', () => {
      const result = validatePasswordStrength('P')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters long')
    })
  })

  describe('missing uppercase', () => {
    it('should return invalid for all lowercase', () => {
      const result = validatePasswordStrength('password1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })

    it('should return invalid for lowercase with numbers', () => {
      const result = validatePasswordStrength('password123')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })

    it('should return invalid for 8 char lowercase only', () => {
      const result = validatePasswordStrength('password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })
  })

  describe('missing lowercase', () => {
    it('should return invalid for all uppercase', () => {
      const result = validatePasswordStrength('PASSWORD1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('should return invalid for uppercase with numbers', () => {
      const result = validatePasswordStrength('PASSWORD123')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('should return invalid for 8 char uppercase only', () => {
      const result = validatePasswordStrength('PASSWORD')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })
  })

  describe('missing number', () => {
    it('should return invalid for letters only', () => {
      const result = validatePasswordStrength('Password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one number')
    })

    it('should return invalid for letters with special chars only', () => {
      const result = validatePasswordStrength('Password!')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one number')
    })
  })

  describe('multiple issues', () => {
    it('should return all issues for empty string', () => {
      const result = validatePasswordStrength('')
      expect(result.valid).toBe(false)
      expect(result.issues).toHaveLength(4)
      expect(result.issues).toContain('Password must be at least 8 characters long')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
    })

    it('should return multiple issues for uppercase only with 8 chars', () => {
      const result = validatePasswordStrength('PASSWORD')
      expect(result.valid).toBe(false)
      expect(result.issues).not.toContain('Password must be at least 8 characters long')
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
      expect(result.issues).not.toContain('Password must contain at least one uppercase letter')
    })

    it('should return multiple issues for lowercase only with 8 chars', () => {
      const result = validatePasswordStrength('password')
      expect(result.valid).toBe(false)
      expect(result.issues).not.toContain('Password must be at least 8 characters long')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).not.toContain('Password must contain at least one lowercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace-only password', () => {
      const result = validatePasswordStrength('        ')
      expect(result.valid).toBe(false)
      expect(result.issues).not.toContain('Password must be at least 8 characters long')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
    })

    it('should handle passwords with spaces', () => {
      const result = validatePasswordStrength('Pass Word1')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should handle unicode characters', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
    })
  })
})
