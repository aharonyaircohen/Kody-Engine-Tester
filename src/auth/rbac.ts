import type { AuthenticatedUser, RbacRole } from './auth-service'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

export interface AuthOptions {
  roles?: RbacRole[]
}

/**
 * Role hierarchy: higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1)
 */
export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
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
 * Check if a user's role can access a target role based on hierarchical RBAC.
 * A user with role X can access any role Y where ROLE_HIERARCHY[X] >= ROLE_HIERARCHY[Y].
 */
export function canAccessRole(userRole: RbacRole, targetRole: RbacRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole]
}

/**
 * Check if a user has a specific permission (based on their role's hierarchy level).
 * Higher roles have more permissions.
 */
export function hasPermission(user: AuthenticatedUser | undefined, minimumRole: RbacRole): boolean {
  if (!user?.role) {
    return false
  }
  return canAccessRole(user.role, minimumRole)
}
