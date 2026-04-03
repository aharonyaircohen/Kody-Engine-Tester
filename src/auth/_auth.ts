import type { AuthenticatedUser, RbacRole } from './auth-service'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
  tenantId?: string
  tenantRole?: RbacRole
}

export interface AuthOptions {
  roles?: RbacRole[]
  tenantRoles?: RbacRole[]
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
 * Check if user has one of the required global roles
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

/**
 * Check if user has one of the required roles for a specific tenant
 */
export function checkTenantRole(
  user: AuthenticatedUser | undefined,
  tenantId: string | undefined,
  tenantRole: RbacRole | undefined,
  roles: RbacRole[] | undefined
): AuthContext {
  if (!user) {
    return { error: 'Authentication required', status: 401 }
  }

  if (!roles || roles.length === 0) {
    return { user, tenantId, tenantRole }
  }

  if (!tenantId) {
    return { error: 'Tenant context required', status: 400 }
  }

  if (!tenantRole) {
    return { error: 'User does not have access to this tenant', status: 403 }
  }

  if (!roles.includes(tenantRole)) {
    return {
      error: `Forbidden: requires tenant role ${roles.join(' or ')}`,
      status: 403,
    }
  }

  return { user, tenantId, tenantRole }
}
