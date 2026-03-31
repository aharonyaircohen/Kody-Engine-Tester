import type { User } from '../auth/user-store'
import type { Session } from '../auth/session-store'

export type { User, Session }

export interface AccessContext {
  user?: User
  session?: Session
}

export type Role = 'admin' | 'instructor' | 'student' | 'user' | 'guest'

export function isAdmin(ctx: AccessContext): boolean {
  return ctx.user?.role === 'admin'
}

export function isInstructor(ctx: AccessContext): boolean {
  return ctx.user?.role === 'instructor' || ctx.user?.role === 'admin'
}

export function isStudent(ctx: AccessContext): boolean {
  return ctx.user?.role === 'student' || ctx.user?.role === 'admin'
}

export function isAuthenticated(ctx: AccessContext): boolean {
  return !!ctx.user && !!ctx.session
}

export function hasRole(ctx: AccessContext, ...roles: Role[]): boolean {
  return !!ctx.user && roles.includes(ctx.user.role as Role)
}

export function requireAuth(ctx: AccessContext): { error: string; status: number } | null {
  if (!ctx.user) {
    return { error: 'Authentication required', status: 401 }
  }
  if (!ctx.session) {
    return { error: 'Valid session required', status: 401 }
  }
  return null
}

export function requireRole(ctx: AccessContext, ...roles: Role[]): { error: string; status: number } | null {
  const authError = requireAuth(ctx)
  if (authError) return authError

  if (!hasRole(ctx, ...roles)) {
    return {
      error: `Forbidden: requires one of roles [${roles.join(', ')}]`,
      status: 403,
    }
  }
  return null
}

export function requireAdmin(ctx: AccessContext): { error: string; status: number } | null {
  return requireRole(ctx, 'admin')
}

export function requireInstructor(ctx: AccessContext): { error: string; status: number } | null {
  return requireRole(ctx, 'admin', 'instructor')
}

export function requireStudent(ctx: AccessContext): { error: string; status: number } | null {
  return requireRole(ctx, 'admin', 'student')
}

// Field-level access helpers
export function canReadField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can read all fields
  if (isAdmin(ctx)) return true

  // Users can read their own fields
  if (ownerId && ctx.user?.id === ownerId) return true

  // Instructors can read course-related fields
  if (isInstructor(ctx)) return true

  // Students can read public fields
  const publicFields = ['title', 'description', 'thumbnail', 'status', 'difficulty', 'estimatedHours', 'tags']
  if (publicFields.includes(fieldName)) return true

  return false
}

export function canWriteField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can write all fields
  if (isAdmin(ctx)) return true

  // Users can write their own fields (except role)
  if (ownerId && ctx.user?.id === ownerId) {
    return fieldName !== 'role' && fieldName !== 'isActive'
  }

  // Instructors can write course-related fields they own
  if (isInstructor(ctx) && ownerId && ctx.user?.id === ownerId) {
    const instructorFields = ['title', 'description', 'thumbnail', 'status', 'difficulty', 'estimatedHours', 'tags', 'maxEnrollments']
    return instructorFields.includes(fieldName)
  }

  return false
}

export { usersAccess } from './users'
export { coursesAccess } from './courses'
export { enrollmentsAccess } from './enrollments'
