import type { User } from '../auth/user-store'
import type { RbacRole } from '../auth/auth-service'

interface RoleContext {
  user?: User
  tenantId?: string
  tenantRole?: RbacRole
}

interface RoleError {
  error: string
  status: number
}

export function requireRole(...roles: string[]) {
  return function roleGuard(context: RoleContext): RoleError | undefined {
    if (!context.user) {
      return { error: 'Authentication required', status: 401 }
    }

    if (!context.user.role) {
      return { error: 'User role not configured', status: 401 }
    }

    if (!roles.includes(context.user.role)) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}

/**
 * Require tenant-specific role
 * If tenantId is provided but tenantRole is not, access is denied
 */
export function requireTenantRole(...roles: string[]) {
  return function tenantRoleGuard(context: RoleContext): RoleError | undefined {
    if (!context.user) {
      return { error: 'Authentication required', status: 401 }
    }

    // If tenant context is expected but not provided
    if (context.tenantId && !context.tenantRole) {
      return { error: 'User does not have access to this tenant', status: 403 }
    }

    // If we have a tenant role, check it
    if (context.tenantRole) {
      if (!roles.includes(context.tenantRole)) {
        return {
          error: `Forbidden: requires tenant role ${roles.join(' or ')}`,
          status: 403,
        }
      }
      return undefined
    }

    // Fall back to global role check
    if (!context.user.role) {
      return { error: 'User role not configured', status: 401 }
    }

    if (!roles.includes(context.user.role)) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}
