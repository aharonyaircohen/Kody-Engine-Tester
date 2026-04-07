/**
 * User domain model with password hashing
 * @module models/user
 */

import * as crypto from 'crypto'
import bcrypt from 'bcrypt'

const BCRYPT_ROUNDS = 10

export interface User {
  id: string
  email: string
  passwordHash: string
}

export interface CreateUserInput {
  email: string
  password: string
}

export interface UserSchema {
  id?: string
  email?: string
  passwordHash?: string
}

/**
 * Creates a new user with hashed password.
 * Email must be unique.
 */
export async function createUser(input: CreateUserInput, existingEmails: Set<string>): Promise<User> {
  if (!input.email) {
    throw new Error('Email is required')
  }
  if (!input.password) {
    throw new Error('Password is required')
  }
  if (existingEmails.has(input.email)) {
    throw new Error('Email already exists')
  }

  const passwordHash = await hashPassword(input.password)

  const user: User = {
    id: crypto.randomUUID(),
    email: input.email,
    passwordHash,
  }

  existingEmails.add(input.email)

  return user
}

/**
 * Hashes a password using bcrypt with automatic salt generation.
 * Each call produces a different hash due to random salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verifies a password against a bcrypt hash.
 * Returns true if password matches, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validates that a user object has all required fields.
 */
export function validateUserSchema(data: unknown): { valid: true; user: User } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'User must be an object' }
  }

  const obj = data as Record<string, unknown>

  if (typeof obj.id !== 'string' || !obj.id) {
    return { valid: false, error: 'id must be a non-empty string' }
  }

  if (typeof obj.email !== 'string' || !obj.email) {
    return { valid: false, error: 'email must be a non-empty string' }
  }

  if (typeof obj.passwordHash !== 'string' || !obj.passwordHash) {
    return { valid: false, error: 'passwordHash must be a non-empty string' }
  }

  return { valid: true, user: data as User }
}
