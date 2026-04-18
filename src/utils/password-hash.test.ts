import { describe, it, expect } from 'vitest'
import { generatePasswordHash, verifyPasswordHash } from './password-hash'

describe('generatePasswordHash', () => {
  it('should return a non-empty string', () => {
    const hash = generatePasswordHash('MyPassword123')
    expect(hash).toBeDefined()
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should not equal the plaintext password', () => {
    const password = 'MySecretPassword!'
    const hash = generatePasswordHash(password)
    expect(hash).not.toBe(password)
  })

  it('should contain a salt:hash delimiter', () => {
    const hash = generatePasswordHash('MyPassword123')
    expect(hash.includes(':')).toBe(true)
  })

  it('should produce different hashes for the same password (salt uniqueness)', () => {
    const password = 'SamePassword'
    const hash1 = generatePasswordHash(password)
    const hash2 = generatePasswordHash(password)
    expect(hash1).not.toBe(hash2)
  })
})

describe('verifyPasswordHash', () => {
  it('should return true when password matches the stored hash', async () => {
    const password = 'CorrectPassword123!'
    const hash = generatePasswordHash(password)
    const result = await verifyPasswordHash(password, hash)
    expect(result).toBe(true)
  })

  it('should return false when password does not match the stored hash', async () => {
    const password = 'CorrectPassword123!'
    const hash = generatePasswordHash(password)
    const result = await verifyPasswordHash('WrongPassword456!', hash)
    expect(result).toBe(false)
  })

  it('should return false when hash is empty string', async () => {
    const result = await verifyPasswordHash('AnyPassword', '')
    expect(result).toBe(false)
  })

  it('should return false when hash is tampered with', async () => {
    const password = 'MyPassword123'
    const hash = generatePasswordHash(password)
    const tamperedHash = hash.slice(0, -4) + 'xxxx'
    const result = await verifyPasswordHash(password, tamperedHash)
    expect(result).toBe(false)
  })
})
