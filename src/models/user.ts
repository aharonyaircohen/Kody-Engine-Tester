import crypto from 'crypto'

/**
 * User domain model types
 * @module models/user
 */

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  password: string
}

export interface UserFilter {
  email?: string
}

/**
 * Hashes a password using PBKDF2 with a random salt.
 * Uses the same algorithm as Payload's generatePasswordSaltHash: 25000 iterations, sha256, 512 bits.
 * Each call produces a unique hash due to random salt.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = await pbkdf2Hash(password, salt)
  return { hash, salt }
}

/**
 * Verifies a password against a stored hash and salt using timing-safe comparison.
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  return pbkdf2Verify(password, hash, salt)
}

function pbkdf2Hash(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      resolve(Buffer.from(derivedKey).toString('hex'))
    })
  })
}

function pbkdf2Verify(password: string, storedHash: string, salt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
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
