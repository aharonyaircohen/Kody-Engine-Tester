import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid for password meeting all requirements', () => {
    const result = validatePasswordStrength('Password1')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('returns valid for complex password', () => {
    const result = validatePasswordStrength('MyP@ssw0rd!')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('returns invalid for password shorter than 8 characters', () => {
    const result = validatePasswordStrength('Pass1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
  })

  it('returns invalid for password missing uppercase', () => {
    const result = validatePasswordStrength('password1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('returns invalid for password missing lowercase', () => {
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
    expect(result.issues).toContain('Password must be at least 8 characters')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns invalid for empty string', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns invalid for non-string input', () => {
    const result = validatePasswordStrength(null as unknown as string)
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be a string')
  })

  it('returns invalid for undefined input', () => {
    const result = validatePasswordStrength(undefined as unknown as string)
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be a string')
  })

  it('returns invalid for number input', () => {
    const result = validatePasswordStrength(12345678 as unknown as string)
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be a string')
  })

  it('handles exactly 8 characters meeting all requirements', () => {
    const result = validatePasswordStrength('Passw0rd')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('handles whitespace in password', () => {
    const result = validatePasswordStrength('Pass word1')
    expect(result.valid).toBe(true)
  })

  it('handles special characters in password', () => {
    const result = validatePasswordStrength('P@ssw0rd!')
    expect(result.valid).toBe(true)
  })
})
