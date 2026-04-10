import crypto from 'crypto'

const ITERATIONS = 25000
const KEY_LENGTH = 512
const DIGEST = 'sha256'
const SALT_LENGTH = 32

/**
 * Hashes a plaintext password using PBKDF2 with a random salt.
 * Returns a string in the format `salt:hash` where both are hex-encoded.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plaintext, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

/**
 * Verifies a plaintext password against a stored hash.
 * Returns true if the password matches, false otherwise.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  const idx = hash.indexOf(':')
  if (idx === -1) return false
  const salt = hash.slice(0, idx)
  const storedKey = hash.slice(idx + 1)
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plaintext, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      const derivedHex = derivedKey.toString('hex')
      resolve(crypto.timingSafeEqual(Buffer.from(derivedHex), Buffer.from(storedKey)))
    })
  })
}
