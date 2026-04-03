import type { NextRequest } from 'next/server'
import type { AuthenticatedUser, RbacRole } from './auth-service'
import { AuthService } from './auth-service'
import { JwtService } from './jwt-service'
import { getPayloadInstance } from '@/services/progress'
import { extractBearerToken, checkRole } from './_auth'

export { extractBearerToken, checkRole }
export type { AuthContext, AuthOptions } from './_auth'

let jwtServiceInstance: JwtService | null = null
let authServiceInstance: AuthService | null = null

function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceInstance
}

function getAuthService(): AuthService {
  if (!authServiceInstance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authServiceInstance = new AuthService(getPayloadInstance() as any, getJwtService())
  }
  return authServiceInstance
}

export interface RouteContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
  tenantId?: string
  tenantRole?: RbacRole
}

export interface WithAuthOptions {
  roles?: RbacRole[]
  optional?: boolean // If true, allow unauthenticated requests (but still validate if token present)
  tenantParam?: string // URL param name to extract tenant ID from (e.g., 'organizationId')
  tenantHeader?: string // Header name to extract tenant ID from
  requireTenant?: boolean // If true, tenant context is required
}

/**
 * Extract tenant ID from request
 */
function extractTenantId(req: NextRequest, options: WithAuthOptions): string | undefined {
  // Check header first
  if (options.tenantHeader) {
    const headerValue = req.headers.get(options.tenantHeader)
    if (headerValue) return headerValue
  }

  // Check URL params (Next.js route params would be passed separately)
  // This is a fallback for when tenant ID is part of the URL path
  const url = new URL(req.url)
  if (options.tenantParam) {
    const paramValue = url.searchParams.get(options.tenantParam)
    if (paramValue) return paramValue
  }

  // Also check x-tenant-id header as a convention
  return req.headers.get('x-tenant-id') ?? undefined
}

/**
 * Higher-order function that wraps an API route handler with authentication.
 *
 * Usage:
 * ```
 * export const GET = withAuth(async (req, { user }, routeParams) => {
 *   // user is guaranteed to be authenticated here
 *   const { params } = routeParams
 *   return Response.json({ data: user })
 * }, { roles: ['admin', 'editor'] })
 * ```
 *
 * Multi-tenant usage:
 * ```
 * export const GET = withAuth(async (req, { user, tenantId, tenantRole }, routeParams) => {
 *   // user is authenticated and has tenant context
 *   return Response.json({ data: user, tenant: tenantId, role: tenantRole })
 * }, { roles: ['admin', 'editor'], tenantHeader: 'x-tenant-id' })
 * ```
 *
 * Note: The handler receives (req, context, routeParams) where routeParams
 * includes Next.js route params like { params }.
 */
export function withAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: NextRequest, context: RouteContext, routeParams?: any) => Promise<Response>,
  options: WithAuthOptions = {}
) {
  return async (req: NextRequest, routeParams?: unknown): Promise<Response> => {
    const authHeader = req.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    // If optional and no token, proceed without auth
    if (options.optional && !token) {
      return handler(req, {}, routeParams)
    }

    // If no token provided and not optional, reject
    if (!token) {
      return Response.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Extract tenant ID if tenant-aware
    const tenantId = extractTenantId(req, options)

    // If tenant is required but not provided
    if (options.requireTenant && !tenantId) {
      return Response.json(
        { error: 'Tenant context required' },
        { status: 400 }
      )
    }

    let authContext: RouteContext

    try {
      const authService = getAuthService()
      const result = await authService.verifyAccessToken(token, tenantId)

      if (result.user) {
        // Check global role if roles are specified
        const roleCheck = checkRole(result.user, options.roles)
        if (roleCheck.error) {
          return Response.json(
            { error: roleCheck.error },
            { status: roleCheck.status ?? 401 }
          )
        }

        // Get tenant-specific role if tenantId is provided
        let tenantRole: RbacRole | undefined
        if (tenantId) {
          tenantRole = authService.getTenantRole(result.user, tenantId) ?? undefined
        }

        authContext = {
          user: result.user,
          tenantId,
          tenantRole,
        }
      } else {
        authContext = { error: 'User not found', status: 404 }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return Response.json({ error: message }, { status: 401 })
    }

    if (authContext.error) {
      return Response.json(
        { error: authContext.error },
        { status: authContext.status ?? 401 }
      )
    }

    return handler(req, authContext as RouteContext, routeParams)
  }
}
