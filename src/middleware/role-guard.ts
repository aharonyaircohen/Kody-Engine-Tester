import type { User, UserRole } from '../auth/user-store'

interface RoleContext {
  user?: User
}

export interface RoleError {
  error: string
  status: number
}

// Role hierarchy: admin > editor > viewer
// A higher role can access permissions of lower roles
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (requiredRoles.length === 0) return true

  // Check if user has any of the required roles
  const userLevel = ROLE_HIERARCHY[userRole]

  for (const required of requiredRoles) {
    const requiredLevel = ROLE_HIERARCHY[required]
    // User can access if their role level >= required role level
    if (userLevel >= requiredLevel) {
      return true
    }
  }

  return false
}

export function requireRole(...roles: UserRole[]) {
  return function roleGuard(context: RoleContext): RoleError | undefined {
    if (!context.user) {
      return { error: 'Authentication required', status: 401 }
    }

    if (!context.user.role) {
      return { error: 'User role not configured', status: 401 }
    }

    if (!hasPermission(context.user.role, roles)) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}

export function requireAdmin(context: RoleContext): RoleError | undefined {
  return requireRole('admin')(context)
}

export function requireEditor(context: RoleContext): RoleError | undefined {
  return requireRole('admin', 'editor')(context)
}
