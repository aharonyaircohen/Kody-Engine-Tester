/**
 * Password hashing utilities using PBKDF2-SHA256.
 *
 * Matches Payload's generatePasswordSaltHash algorithm:
 *   iterations = 25000, keylen = 512 bits (64 bytes), digest = sha256
 *
 * Storage format: `salt:hash` — both values hex-encoded.
 */

import crypto from 'crypto'

const PBKDF2_ITERATIONS = 25000
const PBKDF2_KEYLEN = 512 // bits → 64 bytes → 128 hex chars
const PBKDF2_DIGEST = 'sha256'
const SALT_BYTES = 16 // 128-bit salt → 32 hex chars

/**
 * Generates a PBKDF2 hash for the given plaintext password.
 * Returns a single string in the format `salt:hash` (both hex-encoded).
 */
export function generatePasswordHash(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN / 8, PBKDF2_DIGEST)
    .toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifies a plaintext password against a stored `salt:hash` value.
 * Returns `true` if the password matches, `false` otherwise.
 */
export function verifyPasswordHash(password: string, storedValue: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = storedValue.split(':')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      resolve(false)
      return
    }

    const [salt, hash] = parts
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN / 8, PBKDF2_DIGEST, (err, derivedKey) => {
      if (err) {
        resolve(false)
        return
      }

      const derivedHex = derivedKey.toString('hex')
      const storedHashBuffer = Buffer.from(hash, 'hex')

      // Guard: if derived key and stored hash lengths differ, reject
      if (derivedKey.length !== storedHashBuffer.length) {
        resolve(false)
        return
      }

      resolve(crypto.timingSafeEqual(derivedKey, storedHashBuffer))
    })
  })
}
