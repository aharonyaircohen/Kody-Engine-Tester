import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import { ROLE_HIERARCHY, extractBearerToken } from '@/auth/_auth'
import type { RbacRole } from '@/auth/auth-service'

export type NextMiddleware = (request: NextRequest) => NextResponse | Promise<NextResponse>

let _jwtService: JwtService | null = null

function getJwtService(): JwtService {
  if (!_jwtService) {
    _jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return _jwtService
}

/**
 * Factory that creates an RBAC middleware requiring one of the specified roles.
 * Uses hierarchical role checks: admin > editor > viewer.
 * Attaches x-user-id and x-user-role headers for downstream handlers.
 */
export function requireRole(...roles: RbacRole[]): NextMiddleware {
  return async function rbacMiddleware(request: NextRequest): Promise<NextResponse> {
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number; iat: number; exp: number }

    try {
      payload = (await getJwtService().verify(token)) as never
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    const userRole = payload.role

    if (!userRole) {
      return NextResponse.json({ error: 'User role not configured' }, { status: 401 })
    }

    const userRoleLevel = ROLE_HIERARCHY[userRole]
    const hasSufficientRole = roles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])

    if (!hasSufficientRole) {
      return NextResponse.json(
        { error: `Forbidden: requires role ${roles.join(' or ')}` },
        { status: 403 }
      )
    }

    // Attach user context to headers for downstream handlers
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)
    return response
  }
}
