import { describe, it, expect } from 'vitest'
import { generateSalt, hashPassword, verifyPassword } from './password-utils'

describe('generateSalt', () => {
  it('should return a non-empty hex string', () => {
    const salt = generateSalt()
    expect(typeof salt).toBe('string')
    expect(salt.length).toBeGreaterThan(0)
    expect(salt).toMatch(/^[0-9a-f]+$/)
  })

  it('should return 32-character hex string (16 bytes)', () => {
    const salt = generateSalt()
    // 16 bytes → 32 hex chars
    expect(salt.length).toBe(32)
  })

  it('should generate unique salts on successive calls', () => {
    const salt1 = generateSalt()
    const salt2 = generateSalt()
    const salt3 = generateSalt()
    expect(salt1).not.toBe(salt2)
    expect(salt2).not.toBe(salt3)
    expect(salt1).not.toBe(salt3)
  })
})

describe('hashPassword', () => {
  it('should return an object with hash and salt properties', async () => {
    const result = await hashPassword('TestPassword123!')
    expect(result).toHaveProperty('hash')
    expect(result).toHaveProperty('salt')
    expect(typeof result.hash).toBe('string')
    expect(typeof result.salt).toBe('string')
  })

  it('should return non-empty hex strings for hash and salt', async () => {
    const result = await hashPassword('AnotherPass1!')
    expect(result.hash.length).toBeGreaterThan(0)
    expect(result.salt.length).toBeGreaterThan(0)
    expect(result.hash).toMatch(/^[0-9a-f]+$/)
    expect(result.salt).toMatch(/^[0-9a-f]+$/)
  })

  it('should generate different salts for the same password', async () => {
    const result1 = await hashPassword('SamePassword1!')
    const result2 = await hashPassword('SamePassword1!')
    expect(result1.salt).not.toBe(result2.salt)
    expect(result1.hash).not.toBe(result2.hash)
  })

  it('should produce verifiable hashes', async () => {
    const { hash, salt } = await hashPassword('VerifyMe1!')
    const valid = await verifyPassword('VerifyMe1!', hash, salt)
    expect(valid).toBe(true)
  })

  it('should reject wrong passwords', async () => {
    const { hash, salt } = await hashPassword('CorrectPassword1!')
    const valid = await verifyPassword('WrongPassword1!', hash, salt)
    expect(valid).toBe(false)
  })

  it('should produce different hashes for different passwords with same salt params', async () => {
    const { hash: hash1 } = await hashPassword('PassOne1!')
    const { hash: hash2 } = await hashPassword('PassTwo1!')
    expect(hash1).not.toBe(hash2)
  })
})
