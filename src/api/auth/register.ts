import type { UserStore } from '../../auth/user-store'
import type { SessionStore } from '../../auth/session-store'
import type { JwtService } from '../../auth/jwt-service'
import { login } from './login'

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
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService
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

  const existing = await userStore.findByEmail(email)
  if (existing) {
    throw createError('Email already in use', 409)
  }

  await userStore.create({ email, password, role: 'viewer' })

  return login(email, password, ipAddress, userAgent, userStore, sessionStore, jwtService)
}
