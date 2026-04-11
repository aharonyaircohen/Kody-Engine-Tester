/**
 * RBAC (Role-Based Access Control) utilities for authentication and authorization.
 *
 * This module centralizes role hierarchy and role checking utilities used across
 * the authentication system.
 */

import type { AuthenticatedUser } from './auth-service'
import type { RbacRole } from './auth-service'

export type { RbacRole } from './auth-service'

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
 * Context returned when checking authentication/authorization
 */
export interface RbacContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

/**
 * Check if user has one of the required roles (with hierarchical inheritance)
 * A user with a higher role can access lower-role resources
 */
export function checkRole(user: AuthenticatedUser | undefined, roles: RbacRole[] | undefined): RbacContext {
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
 * Create a role guard function that checks if the user has one of the required roles.
 * Returns undefined if access is allowed, or an error object if denied.
 *
 * @example
 * const guard = requireRole('admin', 'editor')
 * const result = guard({ user: { id: '1', email: 'test@example.com', role: 'admin', isActive: true } })
 * // result is undefined if allowed, or { error: '...', status: 403 } if denied
 */
export function requireRole(...roles: RbacRole[]) {
  return function roleGuard(context: { user?: AuthenticatedUser }): { error: string; status: number } | undefined {
    const result = checkRole(context.user, roles)
    if (result.error) {
      return { error: result.error, status: result.status ?? 401 }
    }
    return undefined
  }
}
