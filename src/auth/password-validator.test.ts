import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid for password meeting all requirements', () => {
    const result = validatePasswordStrength('Password1')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('returns valid for complex password', () => {
    const result = validatePasswordStrength('MyP4ssw0rd!@#$')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('returns invalid and issues for password too short', () => {
    const result = validatePasswordStrength('Pass1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
  })

  it('returns invalid and issues for missing uppercase letter', () => {
    const result = validatePasswordStrength('password1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('returns invalid and issues for missing lowercase letter', () => {
    const result = validatePasswordStrength('PASSWORD1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
  })

  it('returns invalid and issues for missing number', () => {
    const result = validatePasswordStrength('Password')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns multiple issues for password failing multiple requirements', () => {
    const result = validatePasswordStrength('pass')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns invalid for empty password', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns invalid for null/undefined input', () => {
    expect(validatePasswordStrength(null as unknown as string).valid).toBe(false)
    expect(validatePasswordStrength(undefined as unknown as string).valid).toBe(false)
  })

  it('returns invalid for non-string input', () => {
    expect(validatePasswordStrength(1234567890 as unknown as string).valid).toBe(false)
  })

  it('returns valid for exactly 8 characters meeting requirements', () => {
    const result = validatePasswordStrength('PassWord1')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })
})
