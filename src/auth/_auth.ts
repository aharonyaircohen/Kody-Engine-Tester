import type { AuthenticatedUser, RbacRole } from './auth-service'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

export interface AuthOptions {
  roles?: RbacRole[]
}

import { ROLE_HIERARCHY } from './roles'
export { ROLE_HIERARCHY }

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
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
