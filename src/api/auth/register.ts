import type { AuthService } from '../../auth/auth-service'
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

export async function register(
  email: string,
  password: string,
  confirmPassword: string,
  ipAddress: string,
  userAgent: string,
  payload: Payload,
  authService: AuthService
) {
  if (!email || !password || !confirmPassword) {
    throw createError('Email, password, and confirm password are required', 400)
  }

  if (!EMAIL_REGEX.test(email)) {
    throw createError('Invalid email format', 400)
  }

  if (password !== confirmPassword) {
    throw createError('Passwords do not match', 400)
  }

  const strengthError = validatePasswordStrength(password)
  if (strengthError) {
    throw createError(strengthError, 400)
  }

  // Check if user already exists via Payload
  const existing = await payload.find({
    collection: 'users' as CollectionSlug,
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    throw createError('Email already in use', 409)
  }

  // Create user in Payload - Payload handles password hashing via its internal mechanism
  await payload.create({
    collection: 'users' as CollectionSlug,
    data: {
      email,
      password,
      role: 'viewer',
    } as any,
  })

  // Log the user in to get tokens
  return authService.login(email, password, ipAddress, userAgent)
}
