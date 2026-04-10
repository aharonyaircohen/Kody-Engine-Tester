import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Hash a plaintext password using bcryptjs
 */
export async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a plaintext password against a bcrypt hash
 */
export async function verify(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}