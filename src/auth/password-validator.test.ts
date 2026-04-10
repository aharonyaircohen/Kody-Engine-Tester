import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid for password meeting all requirements', () => {
    const result = validatePasswordStrength('Password1')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('returns valid for strong password with special characters', () => {
    const result = validatePasswordStrength('MyP@ssw0rd!')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('returns invalid and issues for password too short', () => {
    const result = validatePasswordStrength('Pass1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters long')
  })

  it('returns invalid and issues for password missing uppercase', () => {
    const result = validatePasswordStrength('password1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('returns invalid and issues for password missing lowercase', () => {
    const result = validatePasswordStrength('PASSWORD1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
  })

  it('returns invalid and issues for password missing number', () => {
    const result = validatePasswordStrength('Password')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns multiple issues for password missing several requirements', () => {
    const result = validatePasswordStrength('abc')
    expect(result.valid).toBe(false)
    expect(result.issues).toHaveLength(3)
    expect(result.issues).toContain('Password must be at least 8 characters long')
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns invalid for empty string', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters long')
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
    expect(validatePasswordStrength({} as unknown as string).valid).toBe(false)
  })

  it('accepts exactly 8 character password', () => {
    const result = validatePasswordStrength('Passw0rd')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('accepts password with only required characters', () => {
    const result = validatePasswordStrength('Ab1ccccc')
    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })
})