import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, generateSalt, verifyPasswordSync } from './password-hash'

describe('password-hash utilities', () => {
  describe('generateSalt', () => {
    it('should generate a 64-character hex string (256 bits)', () => {
      const salt = generateSalt()
      expect(salt).toHaveLength(64)
      expect(/^[a-f0-9]+$/.test(salt)).toBe(true)
    })

    it('should generate unique salts each time', () => {
      const salt1 = generateSalt()
      const salt2 = generateSalt()
      expect(salt1).not.toBe(salt2)
    })
  })

  describe('hashPassword', () => {
    it('should generate a hash that is 128 characters (512 bits in hex)', async () => {
      const result = await hashPassword('testPassword123')
      expect(result.hash).toHaveLength(128)
      expect(/^[a-f0-9]+$/.test(result.hash)).toBe(true)
    })

    it('should generate a salt when not provided', async () => {
      const result = await hashPassword('testPassword123')
      expect(result.salt).toHaveLength(64)
    })

    it('should use provided salt when given', async () => {
      const customSalt = 'a'.repeat(64)
      const result = await hashPassword('testPassword123', customSalt)
      expect(result.salt).toBe(customSalt)
    })

    it('should generate different hashes for same password with different salts', async () => {
      const result1 = await hashPassword('samePassword')
      const result2 = await hashPassword('samePassword')
      expect(result1.hash).not.toBe(result2.hash)
    })

    it('should produce verifiable hashes', async () => {
      const password = 'MySecurePassword123!'
      const result = await hashPassword(password)
      const isValid = await verifyPassword(password, result.hash, result.salt)
      expect(isValid).toBe(true)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPassword123!'
      const result = await hashPassword(password)
      const isValid = await verifyPassword(password, result.hash, result.salt)
      expect(isValid).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'CorrectPassword123!'
      const wrongPassword = 'WrongPassword123!'
      const result = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, result.hash, result.salt)
      expect(isValid).toBe(false)
    })

    it('should return false for tampered hash', async () => {
      const password = 'CorrectPassword123!'
      const result = await hashPassword(password)
      const tamperedHash = result.hash.replace('a', 'b')
      const isValid = await verifyPassword(password, tamperedHash, result.salt)
      expect(isValid).toBe(false)
    })

    it('should return false for wrong salt', async () => {
      const password = 'CorrectPassword123!'
      const result = await hashPassword(password)
      const wrongSalt = generateSalt()
      const isValid = await verifyPassword(password, result.hash, wrongSalt)
      expect(isValid).toBe(false)
    })

    it('should reject empty password', async () => {
      const result = await hashPassword('somepassword')
      const isValid = await verifyPassword('', result.hash, result.salt)
      expect(isValid).toBe(false)
    })
  })

  describe('verifyPasswordSync', () => {
    it('should return true for correct password', () => {
      const password = 'CorrectPassword123!'
      const salt = generateSalt()
      const hash = require('crypto').pbkdf2Sync(password, salt, 25000, 64, 'sha256').toString('hex')
      expect(verifyPasswordSync(password, hash, salt)).toBe(true)
    })

    it('should return false for wrong password', () => {
      const password = 'CorrectPassword123!'
      const salt = generateSalt()
      const hash = require('crypto').pbkdf2Sync(password, salt, 25000, 64, 'sha256').toString('hex')
      expect(verifyPasswordSync('WrongPassword', hash, salt)).toBe(false)
    })

    it('should return false for tampered hash', () => {
      const password = 'CorrectPassword123!'
      const salt = generateSalt()
      const hash = require('crypto').pbkdf2Sync(password, salt, 25000, 64, 'sha256').toString('hex')
      const tamperedHash = hash.replace('a', 'b')
      expect(verifyPasswordSync(password, tamperedHash, salt)).toBe(false)
    })

    it('should return false for wrong salt', () => {
      const password = 'CorrectPassword123!'
      const salt = generateSalt()
      const hash = require('crypto').pbkdf2Sync(password, salt, 25000, 64, 'sha256').toString('hex')
      const wrongSalt = generateSalt()
      expect(verifyPasswordSync(password, hash, wrongSalt)).toBe(false)
    })
  })
})