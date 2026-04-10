import { describe, expect, it } from 'vitest'

import { validatePasswordStrength } from './password-validator'

describe('validatePasswordStrength', () => {
  it('returns valid for passwords meeting all requirements', () => {
    const result = validatePasswordStrength('Password1')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('returns invalid for passwords under 8 characters', () => {
    const result = validatePasswordStrength('Pass1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 8 characters')
  })

  it('returns invalid for passwords missing uppercase letters', () => {
    const result = validatePasswordStrength('password1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('returns invalid for passwords missing lowercase letters', () => {
    const result = validatePasswordStrength('PASSWORD1')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one lowercase letter')
  })

  it('returns invalid for passwords missing numbers', () => {
    const result = validatePasswordStrength('Password')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one number')
  })

  it('returns multiple issues for passwords failing multiple requirements', () => {
    const result = validatePasswordStrength('pass')
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(1)
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

  it('returns invalid for empty string', () => {
    const result = validatePasswordStrength('')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password is required')
  })

  it('returns invalid for non-string input', () => {
    const result = validatePasswordStrength(123 as unknown as string)
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password is required')
  })

  it('accepts passwords with exactly 8 characters meeting all requirements', () => {
    const result = validatePasswordStrength('Passwor1')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('accepts passwords with more than 8 characters', () => {
    const result = validatePasswordStrength('MyPassword123')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
