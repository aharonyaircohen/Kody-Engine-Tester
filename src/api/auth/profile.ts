import type { UserStore } from '../../auth/user-store'
import type { User } from '../../auth/user-store'

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

const PASSWORD_REGEX_UPPER = /[A-Z]/
const PASSWORD_REGEX_NUMBER = /[0-9]/
const PASSWORD_REGEX_SPECIAL = /[^A-Za-z0-9]/

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!PASSWORD_REGEX_UPPER.test(password)) return 'Password must contain at least one uppercase letter'
  if (!PASSWORD_REGEX_NUMBER.test(password)) return 'Password must contain at least one number'
  if (!PASSWORD_REGEX_SPECIAL.test(password)) return 'Password must contain at least one special character'
  return null
}

type ProfileOutput = Omit<User, 'passwordHash' | 'salt'>

export async function getProfile(userId: string, userStore: UserStore): Promise<ProfileOutput> {
  const user = await userStore.findById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }
  const { passwordHash, salt, ...profile } = user
  return profile
}

interface UpdateProfileInput {
  email?: string
  newPassword?: string
  currentPassword?: string
}

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput,
  userStore: UserStore
): Promise<ProfileOutput> {
  const user = await userStore.findById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  const storeUpdates: Partial<User> = {}

  if (updates.email) {
    storeUpdates.email = updates.email
  }

  if (updates.newPassword) {
    if (!updates.currentPassword) {
      throw createError('Current password is required', 400)
    }
    const valid = await userStore.verifyPassword(updates.currentPassword, user.passwordHash, user.salt)
    if (!valid) {
      throw createError('Current password is incorrect', 401)
    }
    const strengthError = validatePasswordStrength(updates.newPassword)
    if (strengthError) {
      throw createError(strengthError, 400)
    }
    const { hash, salt } = await hashNewPassword(updates.newPassword)
    storeUpdates.passwordHash = hash
    storeUpdates.salt = salt
  }

  const updated = await userStore.update(userId, storeUpdates)
  if (!updated) {
    throw createError('User not found', 404)
  }

  const { passwordHash, salt, ...profile } = updated
  return profile
}

async function hashNewPassword(password: string): Promise<{ hash: string; salt: string }> {
  const crypto = await import('crypto')
  const salt = crypto.randomBytes(16).toString('hex')
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data)
  const hash = Buffer.from(hashBuffer).toString('hex')
  return { hash, salt }
}
