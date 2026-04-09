import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid for strong passwords', () => {
    expect(validatePasswordStrength('Password1')).toEqual({ valid: true, issues: [] })
    expect(validatePasswordStrength('MyP4ssword')).toEqual({ valid: true, issues: [] })
    expect(validatePasswordStrength('SecurePass123')).toEqual({ valid: true, issues: [] })
  })

  it('returns invalid for passwords under 8 characters', () => {
    const result = validatePasswordStrength('Pass1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
  })

  it('returns invalid for passwords without uppercase', () => {
    const result = validatePasswordStrength('password1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('returns invalid for passwords without lowercase', () => {
    const result = validatePasswordStrength('PASSWORD1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
  })

  it('returns invalid for passwords without numbers', () => {
    const result = validatePasswordStrength('Password')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns multiple issues for weak passwords', () => {
    const result = validatePasswordStrength('pass')
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(1)
  })

  it('returns invalid for empty string', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password is required')
  })

  it('returns invalid for null/undefined', () => {
    expect(validatePasswordStrength(null as unknown as string)).toEqual({
      valid: false,
      issues: ['Password is required'],
    })
    expect(validatePasswordStrength(undefined as unknown as string)).toEqual({
      valid: false,
      issues: ['Password is required'],
    })
  })

  it('returns invalid for non-string input', () => {
    expect(validatePasswordStrength(12345678 as unknown as string)).toEqual({
      valid: false,
      issues: ['Password is required'],
    })
  })
})
