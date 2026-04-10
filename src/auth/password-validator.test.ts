import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid with empty issues for a strong password', () => {
    expect(validatePasswordStrength('MyPassword123')).toEqual({ valid: true, issues: [] })
    expect(validatePasswordStrength('SecureP@ssw0rd')).toEqual({ valid: true, issues: [] })
    expect(validatePasswordStrength('Abcdefgh1')).toEqual({ valid: true, issues: [] })
  })

  it('returns invalid for password shorter than 8 characters', () => {
    const result = validatePasswordStrength('MyP1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
  })

  it('returns invalid for password without uppercase letter', () => {
    const result = validatePasswordStrength('mypassword123')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('returns invalid for password without lowercase letter', () => {
    const result = validatePasswordStrength('MYPASSWORD123')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
  })

  it('returns invalid for password without number', () => {
    const result = validatePasswordStrength('MyPassword')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns multiple issues when password fails multiple requirements', () => {
    const result = validatePasswordStrength('weak')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
    expect(result.issues.length).toBe(3)
  })

  it('returns all four issues for empty string', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
    expect(result.issues.length).toBe(4)
  })

  it('returns false for null/undefined input', () => {
    expect(validatePasswordStrength(null as unknown as string)).toEqual({
      valid: false,
      issues: ['Password must be a string'],
    })
    expect(validatePasswordStrength(undefined as unknown as string)).toEqual({
      valid: false,
      issues: ['Password must be a string'],
    })
  })

  it('returns false for non-string input', () => {
    expect(validatePasswordStrength(1234567890 as unknown as string)).toEqual({
      valid: false,
      issues: ['Password must be a string'],
    })
    expect(validatePasswordStrength({} as unknown as string)).toEqual({
      valid: false,
      issues: ['Password must be a string'],
    })
  })

  it('accepts exactly 8 characters with all requirements met', () => {
    expect(validatePasswordStrength('Abcdefg1').valid).toBe(true)
    expect(validatePasswordStrength('AAAAAAa1').valid).toBe(true)
    expect(validatePasswordStrength('aaaaAAA1').valid).toBe(true)
    expect(validatePasswordStrength('1234567Aa').valid).toBe(true)
  })

  it('handles passwords with spaces', () => {
    const result = validatePasswordStrength('My Pass 1')
    expect(result.valid).toBe(true)
  })

  it('handles passwords with special characters', () => {
    const result = validatePasswordStrength('MyP@ssw0rd!')
    expect(result.valid).toBe(true)
  })
})