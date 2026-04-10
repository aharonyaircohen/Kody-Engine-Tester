import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('should return valid: true for a password meeting all requirements', () => {
    const result = validatePasswordStrength('Password1')

    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('should return valid: false with issues for a short password', () => {
    const result = validatePasswordStrength('Pass1')

    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters long')
  })

  it('should return valid: false with issues for a password missing uppercase letter', () => {
    const result = validatePasswordStrength('password1')

    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('should return valid: false with issues for a password missing lowercase letter', () => {
    const result = validatePasswordStrength('PASSWORD1')

    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
  })

  it('should return valid: false with issues for a password missing number', () => {
    const result = validatePasswordStrength('Passwordabc')

    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('should return multiple issues for a password failing multiple checks', () => {
    const result = validatePasswordStrength('pass')

    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters long')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('should return valid: true for a password with exactly 8 characters meeting all requirements', () => {
    const result = validatePasswordStrength('Abcd1234')

    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('should return valid: false for an empty password', () => {
    const result = validatePasswordStrength('')

    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters long')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })
})