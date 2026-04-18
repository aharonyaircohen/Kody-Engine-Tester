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

export function getAuthService(): AuthService {
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
}

export interface WithAuthOptions {
  roles?: RbacRole[]
  optional?: boolean // If true, allow unauthenticated requests (but still validate if token present)
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

    let authContext: RouteContext

    try {
      const authService = getAuthService()
      const result = await authService.verifyAccessToken(token)
      if (result.user) {
        const roleCheck = checkRole(result.user, options.roles)
        if (roleCheck.error) {
          return Response.json(
            { error: roleCheck.error },
            { status: roleCheck.status ?? 401 }
          )
        }
        authContext = { user: result.user }
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
