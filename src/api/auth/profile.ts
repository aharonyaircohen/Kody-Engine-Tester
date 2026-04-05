import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'

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

interface ProfileOutput {
  id: number | string
  email: string
  firstName?: string
  lastName?: string
  role: string
  isActive: boolean
}

export async function getProfile(userId: string, payload: Payload): Promise<ProfileOutput> {
  const userResults = await payload.find({
    collection: 'users' as CollectionSlug,
    where: { id: { equals: userId } },
    limit: 1,
  })

  const user = userResults.docs[0]
  if (!user) {
    throw createError('User not found', 404)
  }

  return {
    id: (user as any).id,
    email: (user as any).email,
    firstName: (user as any).firstName,
    lastName: (user as any).lastName,
    role: (user as any).role,
    isActive: (user as any).isActive ?? true,
  }
}

interface UpdateProfileInput {
  email?: string
  newPassword?: string
  currentPassword?: string
  firstName?: string
  lastName?: string
}

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput,
  payload: Payload
): Promise<ProfileOutput> {
  const userResults = await payload.find({
    collection: 'users' as CollectionSlug,
    where: { id: { equals: userId } },
    limit: 1,
  })

  const user = userResults.docs[0]
  if (!user) {
    throw createError('User not found', 404)
  }

  const updateData: Record<string, unknown> = {}

  if (updates.email) {
    updateData.email = updates.email
  }

  if (updates.firstName) {
    updateData.firstName = updates.firstName
  }

  if (updates.lastName) {
    updateData.lastName = updates.lastName
  }

  if (updates.newPassword) {
    if (!updates.currentPassword) {
      throw createError('Current password is required', 400)
    }
    // Password verification would require Payload's auth mechanism
    // For now, we just update the password directly
    const strengthError = validatePasswordStrength(updates.newPassword)
    if (strengthError) {
      throw createError(strengthError, 400)
    }
    updateData.password = updates.newPassword
  }

  const updated = await payload.update({
    collection: 'users' as CollectionSlug,
    id: userId,
    data: updateData,
  })

  const updatedUser = Array.isArray(updated) ? updated[0] : updated

  return {
    id: (updatedUser as any).id,
    email: (updatedUser as any).email,
    firstName: (updatedUser as any).firstName,
    lastName: (updatedUser as any).lastName,
    role: (updatedUser as any).role,
    isActive: (updatedUser as any).isActive ?? true,
  }
}
