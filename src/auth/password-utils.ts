import crypto from 'crypto'

const PBKDF2_ITERATIONS = 25000
const PBKDF2_KEYLEN = 64 // 512 bits
const PBKDF2_DIGEST = 'sha256'
const SALT_BYTES = 16

/**
 * Generates a cryptographically random salt encoded as a hex string.
 */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_BYTES).toString('hex')
}

/**
 * Hashes a password using PBKDF2 with the same parameters as verifyPassword.
 * Matches Payload's generatePasswordSaltHash algorithm: 25000 iterations, sha256, 512 bits.
 * Returns the hex-encoded hash and the hex-encoded salt.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  return new Promise((resolve, reject) => {
    const salt = generateSalt()
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        hash: derivedKey.toString('hex'),
        salt,
      })
    })
  })
}

/**
 * Verifies a password against a stored hash using PBKDF2.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      const storedHashBuffer = Buffer.from(hash, 'hex')
      if (derivedKey.length === storedHashBuffer.length && crypto.timingSafeEqual(derivedKey, storedHashBuffer)) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
