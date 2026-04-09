import type { User } from '../auth/user-store'
import { ROLE_HIERARCHY } from '../auth/_auth'
import type { RbacRole } from '../auth/auth-service'

interface RoleContext {
  user?: User
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

    if (!context.user.roles || context.user.roles.length === 0) {
      return { error: 'User role not configured', status: 401 }
    }

    // Get the highest role level from user's roles
    const userHighestRoleLevel = Math.max(...context.user.roles.map(r => ROLE_HIERARCHY[r]))
    const hasSufficientRole = roles.some((requiredRole) => userHighestRoleLevel >= ROLE_HIERARCHY[requiredRole])

    if (!hasSufficientRole) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}