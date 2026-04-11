import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidUrl, isStrongPassword } from './validators'

describe('isValidEmail', () => {
  it('returns true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.org')).toBe(true)
    expect(isValidEmail('user+tag@sub.domain.co')).toBe(true)
  })

  it('returns false for invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('missing@domain')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })

  it('handles null/undefined', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false)
    expect(isValidEmail(undefined as unknown as string)).toBe(false)
  })
})

describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('https://www.domain.org')).toBe(true)
    expect(isValidUrl('https://api.service.io/v1/users')).toBe(true)
  })

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('notaurl')).toBe(false)
    expect(isValidUrl('ftp://invalid.protocol.com')).toBe(false)
    expect(isValidUrl('http://domain')).toBe(false)
    expect(isValidUrl('https://spaces in.url.com')).toBe(false)
  })

  it('handles null/undefined', () => {
    expect(isValidUrl(null as unknown as string)).toBe(false)
    expect(isValidUrl(undefined as unknown as string)).toBe(false)
  })
})

describe('isStrongPassword', () => {
  it('returns valid for strong passwords', () => {
    const result = isStrongPassword('SecureP@ss1')
    expect(result.valid).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('returns reasons for weak passwords', () => {
    const result = isStrongPassword('weak')
    expect(result.valid).toBe(false)
    expect(result.reasons).toContain('Password must be at least 8 characters')
    expect(result.reasons).toContain('Password must contain at least one uppercase letter')
    expect(result.reasons).not.toContain('Password must contain at least one lowercase letter')
    expect(result.reasons).toContain('Password must contain at least one number')
    expect(result.reasons).toContain('Password must contain at least one special character')
  })

  it('detects missing uppercase', () => {
    const result = isStrongPassword('lowercase1!')
    expect(result.valid).toBe(false)
    expect(result.reasons).toContain('Password must contain at least one uppercase letter')
  })

  it('detects missing lowercase', () => {
    const result = isStrongPassword('UPPERCASE1!')
    expect(result.valid).toBe(false)
    expect(result.reasons).toContain('Password must contain at least one lowercase letter')
  })

  it('detects missing number', () => {
    const result = isStrongPassword('NoNumbers!')
    expect(result.valid).toBe(false)
    expect(result.reasons).toContain('Password must contain at least one number')
  })

  it('detects missing special character', () => {
    const result = isStrongPassword('NoSpecial1')
    expect(result.valid).toBe(false)
    expect(result.reasons).toContain('Password must contain at least one special character')
  })

  it('handles null/undefined', () => {
    const nullResult = isStrongPassword(null as unknown as string)
    expect(nullResult.valid).toBe(false)
    expect(nullResult.reasons).toContain('Password is required')

    const undefinedResult = isStrongPassword(undefined as unknown as string)
    expect(undefinedResult.valid).toBe(false)
    expect(undefinedResult.reasons).toContain('Password is required')
  })

  it('accepts various special characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', '|', ';', ':', ',', '.', '<', '>', '?']
    specialChars.forEach((char) => {
      const result = isStrongPassword(`Valid12${char}`)
      expect(result.valid).toBe(true)
    })
  })
})
