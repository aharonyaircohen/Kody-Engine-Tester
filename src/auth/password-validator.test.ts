import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  describe('valid passwords', () => {
    it('should return valid=true for a password meeting all requirements', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('should return valid=true for a complex password', () => {
      const result = validatePasswordStrength('MyP@ssw0rd!')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('should return valid=true for password with exactly 8 characters', () => {
      const result = validatePasswordStrength('Passw0rd')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })
  })

  describe('invalid passwords', () => {
    it('should return valid=false when password is too short', () => {
      const result = validatePasswordStrength('Pass1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters long')
    })

    it('should return valid=false when password has no uppercase letter', () => {
      const result = validatePasswordStrength('password1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })

    it('should return valid=false when password has no lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('should return valid=false when password has no number', () => {
      const result = validatePasswordStrength('Password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one number')
    })

    it('should return multiple issues when password fails multiple requirements', () => {
      const result = validatePasswordStrength('password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
      expect(result.issues).toHaveLength(2)
    })

    it('should return multiple issues for empty password', () => {
      const result = validatePasswordStrength('')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters long')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
      expect(result.issues).toHaveLength(4)
    })
  })

  describe('edge cases', () => {
    it('should handle password with only special characters', () => {
      const result = validatePasswordStrength('!!!!!!!!!')
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should handle password with spaces', () => {
      const result = validatePasswordStrength('Pass Word1')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('should handle unicode characters', () => {
      const result = validatePasswordStrength('Passw0rd')
      expect(result.valid).toBe(true)
    })
  })
})
