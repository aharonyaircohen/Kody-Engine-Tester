import type { RbacRole } from '../auth/auth-service'
import { extractBearerToken, checkRole } from '../auth/_auth'
import { JwtService } from '../auth/jwt-service'
import type { AuthenticatedUser } from '../auth/auth-service'

export interface RbacOptions {
  roles?: RbacRole[]
  optional?: boolean
}

export interface RbacContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

type NextFunction = () => void
type MiddlewareFunction = (context: RbacContext, next: NextFunction) => void

/**
 * Create RBAC middleware that validates JWT tokens and checks role hierarchy.
 *
 * Usage:
 * ```
 * const rbac = createRbacMiddleware({ roles: ['admin', 'editor'] })
 * rbac({ user }, () => { /* proceed *\/ })
 * ```
 */
export function createRbacMiddleware(options: RbacOptions = {}): MiddlewareFunction {
  return function rbacMiddleware(context: RbacContext, next: NextFunction): void {
    // If optional and no token provided, proceed
    if (options.optional && !context.user) {
      next()
      return
    }

    // If roles are required but no user, reject
    if (!context.user) {
      context.error = 'Authentication required'
      context.status = 401
      return
    }

    // Check role hierarchy
    const roleCheck = checkRole(context.user, options.roles)
    if (roleCheck.error) {
      context.error = roleCheck.error
      context.status = roleCheck.status
      return
    }

    next()
  }
}

/**
 * Verify JWT token and extract user context.
 * Returns a context object with user or error/status.
 */
export async function verifyToken(
  authHeader: string | null,
  jwtService: JwtService
): Promise<RbacContext> {
  const token = extractBearerToken(authHeader)

  if (!token) {
    return { error: 'Missing or invalid Authorization header', status: 401 }
  }

  let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number }
  try {
    payload = await jwtService.verify(token) as any
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    return { error: message, status: 401 }
  }

  // Build authenticated user from token payload
  const user: AuthenticatedUser = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    isActive: true,
  }

  return { user }
}

/**
 * Create a full RBAC middleware with JWT verification built-in.
 * Use this for protecting routes with JWT authentication + role checks.
 */
export function createRbacMiddlewareWithAuth(options: RbacOptions = {}) {
  return async function rbacAuthMiddleware(
    authHeader: string | null,
    jwtService: JwtService
  ): Promise<RbacContext> {
    const token = extractBearerToken(authHeader)

    // If optional and no token, proceed without auth
    if (options.optional && !token) {
      return {}
    }

    // If no token provided and not optional, reject
    if (!token) {
      return { error: 'Missing or invalid Authorization header', status: 401 }
    }

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number }
    try {
      payload = await jwtService.verify(token) as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }

    // Build authenticated user from token payload
    const user: AuthenticatedUser = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      isActive: true,
    }

    // Check role hierarchy if roles are required
    if (options.roles && options.roles.length > 0) {
      const roleCheck = checkRole(user, options.roles)
      if (roleCheck.error) {
        return { error: roleCheck.error, status: roleCheck.status }
      }
    }

    return { user }
  }
}
