/**
 * Role guard middleware for RBAC enforcement.
 *
 * This module provides role-based access control utilities that integrate
 * with the JWT-based authentication system.
 */

import type { AuthenticatedUser } from '../auth/auth-service'
import { requireRole as createRequireRole } from '../auth/rbac'
import type { RbacRole } from '../auth/rbac'

export type { RbacRole } from '../auth/rbac'

interface RoleContext {
  user?: AuthenticatedUser
}

interface RoleError {
  error: string
  status: number
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
  return function roleGuard(context: RoleContext): RoleError | undefined {
    const result = createRequireRole(...roles)(context)
    return result
  }
}
