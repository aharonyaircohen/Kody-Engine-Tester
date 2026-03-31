import type { AccessContext } from './index'

export interface UsersAccess {
  canCreate: (ctx: AccessContext) => boolean
  canRead: (ctx: AccessContext, userId: string) => boolean
  canUpdate: (ctx: AccessContext, userId: string) => boolean
  canDelete: (ctx: AccessContext, userId: string) => boolean
  canReadRole: (ctx: AccessContext, userId: string) => boolean
  canUpdateRole: (ctx: AccessContext, userId: string) => boolean
  canList: (ctx: AccessContext) => boolean
}

export const usersAccess: UsersAccess = {
  canCreate(ctx) {
    // Only admins can create users directly
    return ctx.user?.role === 'admin'
  },

  canRead(ctx, userId) {
    // Users can read their own profile
    if (ctx.user?.id === userId) return true
    // Admins can read any user
    if (ctx.user?.role === 'admin') return true
    // Instructors can read student profiles
    if (ctx.user?.role === 'instructor') return true
    return false
  },

  canUpdate(ctx, userId) {
    // Users can update their own profile
    if (ctx.user?.id === userId) return true
    // Admins can update any user
    if (ctx.user?.role === 'admin') return true
    return false
  },

  canDelete(ctx, userId) {
    // Users cannot delete themselves
    if (ctx.user?.id === userId) return false
    // Only admins can delete users
    return ctx.user?.role === 'admin'
  },

  canReadRole(ctx, userId) {
    // Users can read their own role
    if (ctx.user?.id === userId) return true
    // Only admins can read roles of other users
    return ctx.user?.role === 'admin'
  },

  canUpdateRole(ctx, userId) {
    // Users cannot change their own role
    if (ctx.user?.id === userId) return false
    // Only admins can change roles
    return ctx.user?.role === 'admin'
  },

  canList(ctx) {
    // Only authenticated users can list
    return !!ctx.user
  },
}

// Field-level access for user documents
export function canReadUserField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can read all fields
  if (ctx.user?.role === 'admin') return true

  // Users can read their own fields
  if (ownerId && ctx.user?.id === ownerId) return true

  // Instructors can read student email for course communication
  if (ctx.user?.role === 'instructor' && fieldName === 'email') return true

  // Public fields
  const publicFields = ['id', 'role', 'createdAt']
  if (publicFields.includes(fieldName)) return true

  return false
}

export function canWriteUserField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can write all fields
  if (ctx.user?.role === 'admin') return true

  // Users can write their own fields (except sensitive ones)
  if (ownerId && ctx.user?.id === ownerId) {
    const protectedFields = ['role', 'isActive', 'failedLoginAttempts', 'lockedUntil']
    return !protectedFields.includes(fieldName)
  }

  return false
}
