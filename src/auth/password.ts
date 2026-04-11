import bcrypt from 'bcryptjs'

const BCRYPT_SALT_ROUNDS = 12

/**
 * Hashes a plaintext password using bcryptjs with 12 salt rounds.
 * @param plaintext - The plaintext password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_SALT_ROUNDS)
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * @param plaintext - The plaintext password to verify
 * @param hash - The bcrypt hash to verify against
 * @returns A promise that resolves to true if the password matches, false otherwise
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
