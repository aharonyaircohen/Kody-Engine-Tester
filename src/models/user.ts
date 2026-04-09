/**
 * User domain model types
 * @module models/user
 */

import { ok, err, type Result } from '@/utils/result'

/**
 * Email validation regex pattern
 * Allows typical email formats with letters, numbers, dots, hyphens, underscores, and + for aliases
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export type UserRole = 'admin' | 'editor' | 'viewer' | 'guest' | 'student' | 'instructor'

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  passwordHash: string
  role?: UserRole
}

export interface UserFilter {
  role?: UserRole
  isActive?: boolean
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Validates email and returns a Result type
 */
export function validateEmail(email: unknown): Result<string, string> {
  if (typeof email !== 'string') {
    return err('Email must be a string')
  }
  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    return err('Email is required')
  }
  if (!isValidEmail(trimmedEmail)) {
    return err('Invalid email format')
  }
  return ok(trimmedEmail.toLowerCase())
}

/**
 * Validates password hash is not empty (hash must be generated before storing)
 * Password should never be stored in plain text - only the hash is persisted
 */
export function validatePasswordHash(passwordHash: unknown): Result<string, string> {
  if (typeof passwordHash !== 'string') {
    return err('Password hash must be a string')
  }
  if (!passwordHash) {
    return err('Password hash is required')
  }
  // PBKDF2 hashes are 512 bits = 64 bytes = 128 hex chars
  if (passwordHash.length < 64) {
    return err('Invalid password hash format')
  }
  return ok(passwordHash)
}

/**
 * Creates a new User instance after validating input
 */
export function createUser(input: CreateUserInput): Result<User, string> {
  const emailResult = validateEmail(input.email)
  if (!emailResult.isOk()) {
    return err(emailResult.error)
  }

  const passwordResult = validatePasswordHash(input.passwordHash)
  if (!passwordResult.isOk()) {
    return err(passwordResult.error)
  }

  const now = new Date()
  const user: User = {
    id: crypto.randomUUID(),
    email: emailResult.value,
    passwordHash: passwordResult.value,
    createdAt: now,
    updatedAt: now,
  }

  return ok(user)
}

/**
 * Creates a User from raw data (e.g., from database)
 * Does not re-validate email format
 */
export function createUserFromData(data: {
  id: string
  email: string
  passwordHash: string
  createdAt: Date | string
  updatedAt: Date | string
}): Result<User, string> {
  if (!data.id) {
    return err('User ID is required')
  }
  if (!data.email) {
    return err('User email is required')
  }
  if (!data.passwordHash) {
    return err('User password hash is required')
  }

  return ok({
    id: data.id,
    email: data.email,
    passwordHash: data.passwordHash,
    createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
    updatedAt: typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt,
  })
}

/**
 * Updates user fields with validation
 */
export function updateUser(user: User, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Result<User, string> {
  const updatedUser: User = {
    ...user,
    updatedAt: new Date(),
  }

  if (updates.email !== undefined) {
    const emailResult = validateEmail(updates.email)
    if (!emailResult.isOk()) {
      return err(emailResult.error)
    }
    updatedUser.email = emailResult.value
  }

  if (updates.passwordHash !== undefined) {
    const passwordResult = validatePasswordHash(updates.passwordHash)
    if (!passwordResult.isOk()) {
      return err(passwordResult.error)
    }
    updatedUser.passwordHash = passwordResult.value
  }

  return ok(updatedUser)
}