import type { AuthenticatedUser, RbacRole } from './auth-service'

export type Permission =
  | 'users:read' | 'users:write' | 'users:delete'
  | 'courses:read' | 'courses:write' | 'courses:delete'
  | 'grades:read' | 'grades:write'
  | 'enrollments:read' | 'enrollments:write'

export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export const ROLE_PERMISSIONS: Record<RbacRole, Permission[]> = {
  admin: [
    'users:read', 'users:write', 'users:delete',
    'courses:read', 'courses:write', 'courses:delete',
    'grades:read', 'grades:write',
    'enrollments:read', 'enrollments:write',
  ],
  editor: [
    'courses:read', 'courses:write',
    'grades:read', 'grades:write',
    'enrollments:read', 'enrollments:write',
  ],
  viewer: [
    'courses:read',
    'enrollments:read',
  ],
}

/**
 * Check if user has a specific permission based on their role.
 */
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role]
  return userPermissions?.includes(permission) ?? false
}

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

/**
 * Check if user has one of the required roles (with hierarchical inheritance)
 * A user with a higher role can access lower-role resources
 */
export function checkRole(user: AuthenticatedUser | undefined, roles: RbacRole[] | undefined): AuthContext {
  if (!user) {
    return { error: 'Authentication required', status: 401 }
  }

  if (!roles || roles.length === 0) {
    return { user }
  }

  if (!user.role) {
    return { error: 'User role not configured', status: 401 }
  }

  const userRoleLevel = ROLE_HIERARCHY[user.role]
  const hasSufficientRole = roles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])

  if (!hasSufficientRole) {
    return {
      error: `Forbidden: requires role ${roles.join(' or ')}`,
      status: 403,
    }
  }

  return { user }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}