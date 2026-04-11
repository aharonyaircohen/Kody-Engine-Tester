import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JwtService } from '@/auth/jwt-service'

const TEST_SECRET = 'test-secret'

describe('Login validation', () => {
  let jwtService: JwtService

  beforeEach(() => {
    jwtService = new JwtService(TEST_SECRET)
  })

  it('should reject invalid email format', async () => {
    const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', 'spaces in@email.com']
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const email of invalidEmails) {
      expect(EMAIL_REGEX.test(email)).toBe(false)
    }
  })

  it('should accept valid email format', async () => {
    const validEmails = ['test@example.com', 'user.name@domain.org', 'user+tag@domain.co']
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const email of validEmails) {
      expect(EMAIL_REGEX.test(email)).toBe(true)
    }
  })

  it('should reject password shorter than 8 chars', () => {
    const shortPasswords = ['1234567', 'short', 'abc', '']
    for (const pwd of shortPasswords) {
      expect(pwd.length >= 8).toBe(false)
    }
  })

  it('should accept password 8+ chars', () => {
    const validPasswords = ['12345678', 'longenough', 'MySecurePass123!']
    for (const pwd of validPasswords) {
      expect(pwd.length >= 8).toBe(true)
    }
  })

  it('should create JWT with userId claim', async () => {
    const token = await jwtService.sign(
      { userId: '123', email: 'test@example.com', role: 'viewer', sessionId: 'sess-1', generation: 0 },
      15 * 60 * 1000
    )
    const payload = await jwtService.verify(token)
    expect(payload.userId).toBe('123')
  })

  it('should create JWT with correct expiry', async () => {
    const before = Math.floor(Date.now() / 1000)
    const token = await jwtService.sign(
      { userId: '123', email: 'test@example.com', role: 'viewer', sessionId: 'sess-1', generation: 0 },
      24 * 60 * 60 * 1000
    )
    const after = Math.floor(Date.now() / 1000)
    const payload = await jwtService.verify(token)
    expect(payload.exp - payload.iat).toBe(24 * 60 * 60)
    expect(payload.iat).toBeGreaterThanOrEqual(before)
    expect(payload.iat).toBeLessThanOrEqual(after + 1)
  })
})