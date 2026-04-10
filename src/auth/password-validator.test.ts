import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  describe('valid passwords', () => {
    it('returns valid for password meeting all requirements', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('returns valid for complex password', () => {
      const result = validatePasswordStrength('MyP@ssw0rd123')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('returns valid for password at minimum length', () => {
      const result = validatePasswordStrength('Ab123456')
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })
  })

  describe('invalid passwords - missing requirements', () => {
    it('returns invalid for password too short', () => {
      const result = validatePasswordStrength('Pass1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters')
    })

    it('returns invalid for missing uppercase letter', () => {
      const result = validatePasswordStrength('password1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })

    it('returns invalid for missing lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('returns invalid for missing number', () => {
      const result = validatePasswordStrength('Password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one number')
    })
  })

  describe('multiple missing requirements', () => {
    it('returns multiple issues for weak password', () => {
      // 'passwor' is 7 chars (too short), lowercase only, no number
      const result = validatePasswordStrength('passwor')
      expect(result.valid).toBe(false)
      expect(result.issues).toHaveLength(3)
      expect(result.issues).toContain('Password must be at least 8 characters')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
    })

    it('returns multiple issues for empty string', () => {
      const result = validatePasswordStrength('')
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('edge cases', () => {
    it('returns invalid for null input', () => {
      const result = validatePasswordStrength(null as unknown as string)
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be a string')
    })

    it('returns invalid for undefined input', () => {
      const result = validatePasswordStrength(undefined as unknown as string)
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be a string')
    })

    it('returns invalid for non-string input', () => {
      const result = validatePasswordStrength(12345678 as unknown as string)
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be a string')
    })
  })
})