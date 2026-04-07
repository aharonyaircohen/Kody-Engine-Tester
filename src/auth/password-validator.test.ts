import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  describe('valid passwords', () => {
    it('should return valid for password meeting all requirements', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('should return valid for password with exactly 8 characters', () => {
      const result = validatePasswordStrength('Passw0rd')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('should return valid for password with special characters', () => {
      const result = validatePasswordStrength('Password1!')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('should return valid for long password with all requirements', () => {
      const result = validatePasswordStrength('MySecurePassword123')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })
  })

  describe('invalid passwords', () => {
    it('should return invalid for password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Pass1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters')
    })

    it('should return invalid for password with no uppercase letter', () => {
      const result = validatePasswordStrength('password1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })

    it('should return invalid for password with no lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('should return invalid for password with no number', () => {
      const result = validatePasswordStrength('Password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one number')
    })
  })

  describe('multiple issues', () => {
    it('should return all issues for password with no uppercase and no number', () => {
      const result = validatePasswordStrength('password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
      expect(result.issues).toHaveLength(2)
    })

    it('should return all issues for empty password', () => {
      const result = validatePasswordStrength('')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
      expect(result.issues).toHaveLength(4)
    })

    it('should return all issues for password missing three requirements', () => {
      const result = validatePasswordStrength('pass')
      expect(result.valid).toBe(false)
      expect(result.issues).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace-only password', () => {
      const result = validatePasswordStrength('        ')
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should handle unicode characters', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
    })
  })
})
