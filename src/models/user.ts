/**
 * User domain model types
 * @module models/user
 */

import bcrypt from 'bcryptjs'
import type { Validator, ValidatorResult } from '@/validation/validators'
import { required, email as emailValidator, minLength, maxLength } from '@/validation/validators'

const SALT_ROUNDS = 12

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

export type ValidateUserResult = {
  valid: true
  user: User
} | {
  valid: false
  errors: Record<string, string>
}

export type ValidateCreateUserResult = {
  valid: true
} | {
  valid: false
  errors: Record<string, string>
}

export const generateId = (): string => {
  return crypto.randomUUID()
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const validateEmailField = (email: string): ValidatorResult => {
  const validators: Validator<string>[] = [required(), emailValidator()]
  for (const validator of validators) {
    const result = validator(email)
    if (!result.valid) return result
  }
  return { valid: true }
}

export const validatePasswordField = (password: string): ValidatorResult => {
  const validators: Validator<string>[] = [
    required(),
    minLength(8),
    maxLength(128),
  ]
  for (const validator of validators) {
    const result = validator(password)
    if (!result.valid) return result
  }
  return { valid: true }
}

export const validateCreateUserInput = (input: unknown): ValidateCreateUserResult => {
  const errors: Record<string, string> = {}

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: { general: 'Invalid input' } }
  }

  const { email, password } = input as Record<string, unknown>

  const emailResult = validateEmailField(typeof email === 'string' ? email : '')
  if (!emailResult.valid) {
    errors.email = emailResult.error
  }

  const passwordResult = validatePasswordField(typeof password === 'string' ? password : '')
  if (!passwordResult.valid) {
    errors.password = passwordResult.error
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const validation = validateCreateUserInput(input)
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0])
  }

  const passwordHash = await hashPassword(input.password)

  const user: User = {
    id: generateId(),
    email: input.email,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return user
}