import type { AuthenticatedUser, RbacRole } from './auth-service'
import type { TenantRole } from './jwt-service'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

export interface AuthOptions {
  roles?: RbacRole[]
  tenantId?: string
  tenantRoles?: { tenantId: string; roles: RbacRole[] }[]
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
 * Check if user has one of the required roles (global roles)
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
  tenantId: string,
  roles: RbacRole[]
): AuthContext {
  if (!user) {
    return { error: 'Authentication required', status: 401 }
  }

  if (!roles || roles.length === 0) {
    return { user }
  }

  // Check user's roles array for this tenant
  const tenantRoleEntry = user.roles?.find((r: TenantRole) => r.tenantId === tenantId)
  if (tenantRoleEntry && roles.includes(tenantRoleEntry.role as RbacRole)) {
    return { user }
  }

  // Fall back to global role check
  if (user.role && roles.includes(user.role)) {
    return { user }
  }

  return {
    error: `Forbidden: requires role ${roles.join(' or ')} for tenant ${tenantId}`,
    status: 403,
  }
}

/**
 * Get the user's role for a specific tenant
 */
export function getTenantRole(user: AuthenticatedUser | undefined, tenantId: string): RbacRole | null {
  if (!user) return null

  const tenantRoleEntry = user.roles?.find((r: TenantRole) => r.tenantId === tenantId)
  if (tenantRoleEntry) {
    return tenantRoleEntry.role as RbacRole
  }

  return user.role
}
