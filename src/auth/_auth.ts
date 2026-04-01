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
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * Check if user has one of the required roles
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

  if (!roles.includes(user.role)) {
    return {
      error: `Forbidden: requires role ${roles.join(' or ')}`,
      status: 403,
    }
  }

  return { user }
}
