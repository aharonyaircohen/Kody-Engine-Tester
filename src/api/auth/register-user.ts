import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character'
  return null
}

export interface RegisterUserResult {
  id: number | string
  email: string
  role: string
}

export async function registerUser(
  email: string,
  password: string,
  payload: Payload
): Promise<RegisterUserResult> {
  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }

  if (!EMAIL_REGEX.test(email)) {
    throw createError('Invalid email format', 400)
  }

  const strengthError = validatePasswordStrength(password)
  if (strengthError) {
    throw createError(strengthError, 400)
  }

  // Check if user already exists
  const existing = await payload.find({
    collection: 'users' as CollectionSlug,
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    throw createError('Email already in use', 409)
  }

  // Create user in Payload - Password is hashed by Payload's internal mechanism
  const user = await payload.create({
    collection: 'users' as CollectionSlug,
    data: {
      email,
      password,
      role: 'viewer',
    } as any,
  })

  return {
    id: (user as any).id,
    email: (user as any).email,
    role: (user as any).role,
  }
}