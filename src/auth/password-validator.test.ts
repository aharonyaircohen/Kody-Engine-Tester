import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  describe('valid passwords', () => {
    it('returns valid for password meeting all requirements', () => {
      const result = validatePasswordStrength('Password1')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('returns valid for password with exactly 8 characters', () => {
      const result = validatePasswordStrength('Passw0rd')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('returns valid for longer passwords', () => {
      const result = validatePasswordStrength('MySecureP@ssw0rd123')
      expect(result.valid).toBe(true)
      expect(result.issues).toEqual([])
    })
  })

  describe('invalid passwords', () => {
    it('returns invalid for password missing uppercase letter', () => {
      const result = validatePasswordStrength('password1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
    })

    it('returns invalid for password missing lowercase letter', () => {
      const result = validatePasswordStrength('PASSWORD1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('returns invalid for password missing number', () => {
      const result = validatePasswordStrength('Password')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one number')
    })

    it('returns invalid for password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Pass1')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must be at least 8 characters')
    })

    it('returns multiple issues for password failing multiple requirements', () => {
      const result = validatePasswordStrength('short')
      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(1)
      expect(result.issues).toContain('Password must be at least 8 characters')
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
    })
  })

  describe('edge cases', () => {
    it('returns invalid for empty string', () => {
      const result = validatePasswordStrength('')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password is required')
    })

    it('returns invalid for null input', () => {
      const result = validatePasswordStrength(null as unknown as string)
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password is required')
    })

    it('returns invalid for undefined input', () => {
      const result = validatePasswordStrength(undefined as unknown as string)
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password is required')
    })

    it('returns invalid for non-string input', () => {
      const result = validatePasswordStrength(12345 as unknown as string)
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password is required')
    })

    it('handles whitespace-only password as invalid', () => {
      const result = validatePasswordStrength('        ')
      expect(result.valid).toBe(false)
    })

    it('handles password with only numbers', () => {
      const result = validatePasswordStrength('12345678')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one lowercase letter')
    })

    it('handles password with only letters', () => {
      const result = validatePasswordStrength('abcdefgh')
      expect(result.valid).toBe(false)
      expect(result.issues).toContain('Password must contain at least one uppercase letter')
      expect(result.issues).toContain('Password must contain at least one number')
    })
  })
})