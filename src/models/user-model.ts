/**
 * User domain model with secure password hashing
 * @module models/user-model
 */
import bcryptjs from 'bcryptjs'

const BCRYPT_COST_FACTOR = 12

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, BCRYPT_COST_FACTOR)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}