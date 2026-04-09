/**
 * Password hashing utility using PBKDF2
 * @module utils/password-hash
 *
 * Uses PBKDF2 with SHA-256, 25000 iterations, and 512 bits (64 bytes)
 * This matches Payload CMS's generatePasswordSaltHash algorithm for compatibility
 */

import crypto from 'crypto'

const PBKDF2_ITERATIONS = 25000
const KEY_LENGTH = 64 // 512 bits
const DIGEST = 'sha256'
const SALT_LENGTH = 32 // 256 bits

export interface PasswordHashResult {
  hash: string
  salt: string
}

/**
 * Generates a cryptographically secure random salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex')
}

/**
 * Hashes a password using PBKDF2 with SHA-256
 * @param password - Plain text password to hash
 * @param salt - Optional salt (generated if not provided)
 * @returns Object containing the hash and salt
 */
export async function hashPassword(password: string, salt?: string): Promise<PasswordHashResult> {
  const useSalt = salt ?? generateSalt()

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, useSalt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        hash: derivedKey.toString('hex'),
        salt: useSalt,
      })
    })
  })
}

/**
 * Verifies a password against a stored hash and salt
 * @param password - Plain text password to verify
 * @param storedHash - The stored password hash
 * @param salt - The salt used during hashing
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      const storedHashBuffer = Buffer.from(storedHash, 'hex')
      if (derivedKey.length === storedHashBuffer.length && crypto.timingSafeEqual(derivedKey, storedHashBuffer)) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * Synchronous password hash verification for cases where async is not available
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyPasswordSync(password: string, storedHash: string, salt: string): boolean {
  const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST)
  const storedHashBuffer = Buffer.from(storedHash, 'hex')
  if (derivedKey.length !== storedHashBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(derivedKey, storedHashBuffer)
}