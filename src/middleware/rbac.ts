import type { RbacRole } from '../auth/auth-service'
import { ROLE_HIERARCHY } from '../auth/_auth'

// Legacy user roles from UserStore that need mapping during migration
type LegacyRole = 'admin' | 'user' | 'guest' | 'student' | 'instructor'

// Mapping from legacy roles to RbacRole (for migration)
const LEGACY_ROLE_MAPPING: Record<LegacyRole, RbacRole | null> = {
  admin: 'admin',
  user: 'viewer', // Map 'user' to 'viewer'
  guest: null,    // No mapping - will be denied
  student: 'viewer',
  instructor: 'editor',
}

// Extended role type that includes legacy roles
type EffectiveRole = RbacRole | LegacyRole

export interface RbacContext {
  user?: {
    id: string
    email: string
    role?: EffectiveRole
    isActive?: boolean
  }
}

export interface RbacOptions {
  roles?: RbacRole[]
}

/**
 * Error response from RBAC middleware
 */
export interface RbacError {
  error: string
  status: number
}

/**
 * Get the effective RbacRole from a user role (handles legacy roles during migration)
 * Returns null if role is undefined, or an object with the mapped role and whether it was recognized
 *
 * recognized = true means we know about this role (it's either a valid RbacRole or a known legacy role)
 * recognized = false means the role is completely unknown
 */
function getEffectiveRole(role: EffectiveRole | undefined): { role: RbacRole | null; recognized: boolean } {
  if (role === undefined) {
    return { role: null, recognized: false }
  }

  // Check if it's already an RbacRole
  if (role in ROLE_HIERARCHY) {
    return { role: role as RbacRole, recognized: true }
  }

  // Check if it's a known legacy role (even if it maps to null)
  if (role in LEGACY_ROLE_MAPPING) {
    const mappedRole = LEGACY_ROLE_MAPPING[role as LegacyRole]
    return { role: mappedRole, recognized: true }
  }

  // Unknown role
  return { role: null, recognized: false }
}

/**
 * Check if user has one of the required roles (with hierarchical inheritance)
 * A user with a higher role can access lower-role resources
 */
function checkRole(userRole: RbacRole | null, requiredRoles: RbacRole[]): boolean {
  if (!userRole) {
    return false
  }

  const userRoleLevel = ROLE_HIERARCHY[userRole]
  return requiredRoles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])
}

/**
 * Create RBAC middleware that enforces role-based access control
 *
 * Usage:
 * ```
 * const rbac = createRbacMiddleware({ roles: ['admin', 'editor'] })
 * const error = await rbac(context, nextHandler)
 * if (error) return error // access denied
 * return await nextHandler()
 * ```
 */
export function createRbacMiddleware(options: RbacOptions = {}) {
  const { roles } = options

  return async function rbacMiddleware(
    context: RbacContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: () => Promise<Response>
  ): Promise<RbacError | undefined> {
    // Check if user exists
    if (!context.user) {
      return { error: 'Authentication required', status: 401 }
    }

    // Check if user is active
    if (!context.user.isActive) {
      return { error: 'Account is inactive', status: 403 }
    }

    // If no roles required, allow access
    if (!roles || roles.length === 0) {
      return undefined
    }

    // Map legacy role to RbacRole if needed
    const { role: effectiveRole, recognized } = getEffectiveRole(context.user.role)

    // If user has no role defined, return 401
    if (!recognized && !effectiveRole) {
      return { error: 'User role not configured', status: 401 }
    }

    // If user has a role but it's not recognized (maps to null), return 403
    if (recognized && !effectiveRole) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    // Check hierarchical role
    if (!checkRole(effectiveRole, roles)) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}

// Singleton instance for convenience
let rbacMiddlewareInstance: ReturnType<typeof createRbacMiddleware> | null = null

export function getRbacMiddleware(): ReturnType<typeof createRbacMiddleware> {
  if (!rbacMiddlewareInstance) {
    rbacMiddlewareInstance = createRbacMiddleware()
  }
  return rbacMiddlewareInstance
}
