import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid for strong password meeting all requirements', () => {
    const result = validatePasswordStrength('Password1')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('returns invalid for password shorter than 8 characters', () => {
    const result = validatePasswordStrength('Pass1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
  })

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

  it('returns multiple issues for password failing multiple requirements', () => {
    const result = validatePasswordStrength('pass')
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(1)
  })

  it('returns invalid for empty password', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password is required')
  })

  it('returns invalid for null/undefined password', () => {
    expect(validatePasswordStrength(null as unknown as string).valid).toBe(false)
    expect(validatePasswordStrength(undefined as unknown as string).valid).toBe(false)
  })

  it('returns invalid for non-string input', () => {
    expect(validatePasswordStrength(1234567890 as unknown as string).valid).toBe(false)
  })

  it('accepts password with exactly 8 characters', () => {
    const result = validatePasswordStrength('Passwor1')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('accepts password with special characters alongside requirements', () => {
    const result = validatePasswordStrength('Password1!')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
