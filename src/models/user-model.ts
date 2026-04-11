/**
 * User domain model with bcrypt password hashing
 * @module models/user-model
 */

import * as bcrypt from 'bcrypt'

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

export interface PasswordHash {
  hash: string
  salt: string
}

export class PasswordHashingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PasswordHashingError'
  }
}

export const BCRYPT_COST_FACTOR = 12

export async function hashPassword(plaintext: string): Promise<PasswordHash> {
  const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR)
  const hash = await bcrypt.hash(plaintext, salt)
  return { hash, salt }
}

export async function verifyPassword(plaintext: string, passwordHash: PasswordHash): Promise<boolean> {
  return bcrypt.compare(plaintext, passwordHash.hash)
}