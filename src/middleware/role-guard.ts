import type { AuthenticatedUser } from '../auth/auth-service'
import { ROLE_HIERARCHY } from '../auth/_auth'
import type { RbacRole } from '../auth/auth-service'

interface RoleContext {
  user?: AuthenticatedUser
}

interface RoleError {
  error: string
  status: number
}

export function requireRole(...roles: RbacRole[]) {
  return function roleGuard(context: RoleContext): RoleError | undefined {
    if (!context.user) {
      return { error: 'Authentication required', status: 401 }
    }

    if (!context.user.role) {
      return { error: 'User role not configured', status: 401 }
    }

    const userRoleLevel = ROLE_HIERARCHY[context.user.role]
    const hasSufficientRole = roles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])

    if (!hasSufficientRole) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}