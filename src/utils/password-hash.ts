import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export interface HashResult {
  hash: string
}

export async function hashPassword(password: string): Promise<HashResult> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  return { hash }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
