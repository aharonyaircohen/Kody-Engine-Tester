import type { User, UserRole } from '../auth/user-store'
import type { Session } from '../auth/session-store'

export type { User, Session }

export interface AccessContext {
  user?: User
  session?: Session
}

export type Role = UserRole

// Role hierarchy: admin > editor > viewer
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export function isAdmin(ctx: AccessContext): boolean {
  return ctx.user?.role === 'admin'
}

export function isEditor(ctx: AccessContext): boolean {
  const role = ctx.user?.role
  return role === 'admin' || role === 'editor'
}

export function isViewer(ctx: AccessContext): boolean {
  const role = ctx.user?.role
  return role === 'admin' || role === 'editor' || role === 'viewer'
}

export function isAuthenticated(ctx: AccessContext): boolean {
  return !!ctx.user && !!ctx.session
}

export function hasRole(ctx: AccessContext, ...roles: UserRole[]): boolean {
  if (!ctx.user?.role) return false
  return roles.includes(ctx.user.role)
}

export function hasPermissionLevel(ctx: AccessContext, minimumRole: UserRole): boolean {
  const userRole = ctx.user?.role
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
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

export function requireRole(ctx: AccessContext, ...roles: UserRole[]): { error: string; status: number } | null {
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

export function requireEditor(ctx: AccessContext): { error: string; status: number } | null {
  return requireRole(ctx, 'admin', 'editor')
}

export function requireViewer(ctx: AccessContext): { error: string; status: number } | null {
  return requireRole(ctx, 'admin', 'editor', 'viewer')
}

// Field-level access helpers
export function canReadField(ctx: AccessContext, fieldName: string, ownerId?: string): boolean {
  // Admins can read all fields
  if (isAdmin(ctx)) return true

  // Users can read their own fields
  if (ownerId && ctx.user?.id === ownerId) return true

  // Editors can read course-related fields
  if (isEditor(ctx)) return true

  // Viewers can read public fields
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

  // Editors can write course-related fields they own
  if (isEditor(ctx) && ownerId && ctx.user?.id === ownerId) {
    const editorFields = ['title', 'description', 'thumbnail', 'status', 'difficulty', 'estimatedHours', 'tags', 'maxEnrollments']
    return editorFields.includes(fieldName)
  }

  return false
}

export { usersAccess } from './users'
export { coursesAccess } from './courses'
export { enrollmentsAccess } from './enrollments'
