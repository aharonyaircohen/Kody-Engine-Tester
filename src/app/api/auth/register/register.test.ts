import { describe, it, expect } from 'vitest'
import { minLength } from '@/validation/validators'

describe('Register validation', () => {
  it('should reject password shorter than 8 characters', () => {
    const validator = minLength(8)
    const result = validator('1234567')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toBe('Must be at least 8 characters')
    }
  })

  it('should accept password 8 or more characters', () => {
    const validator = minLength(8)
    expect(validator('12345678').valid).toBe(true)
    expect(validator('MySecurePassword123!').valid).toBe(true)
  })

  it('should validate email format', () => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(EMAIL_REGEX.test('user@example.com')).toBe(true)
    expect(EMAIL_REGEX.test('invalid-email')).toBe(false)
  })

  it('should derive firstName and lastName from email prefix', () => {
    const testCases = [
      { email: 'john.doe@example.com', expectedFirst: 'john', expectedLast: 'doe' },
      { email: 'jane_smith@example.com', expectedFirst: 'jane', expectedLast: 'smith' },
      { email: 'user123@example.com', expectedFirst: 'user123', expectedLast: 'user123' },
    ]
    for (const { email, expectedFirst, expectedLast } of testCases) {
      const emailPrefix = email.split('@')[0]
      const [firstName, ...lastNameParts] = emailPrefix.split(/[._-]/)
      const lastName = lastNameParts.join(' ') || emailPrefix
      expect(firstName).toBe(expectedFirst)
      expect(lastName).toBe(expectedLast)
    }
  })
})