import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from './src/auth/jwt-service'
import { extractBearerToken } from './src/auth/_auth'

const jwtService = new JwtService(process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production')

export interface AuthMiddlewareConfig {
  protectedRoutes?: string[]
  publicRoutes?: string[]
}

const DEFAULT_PROTECTED_ROUTES = ['/api/notes', '/api/gradebook', '/api/enroll', '/api/notifications']
const DEFAULT_PUBLIC_ROUTES = ['/api/health', '/api/csrf-token', '/api/courses/search']

export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const protectedRoutes = config.protectedRoutes ?? DEFAULT_PROTECTED_ROUTES
  const publicRoutes = config.publicRoutes ?? DEFAULT_PUBLIC_ROUTES

  return async function authMiddleware(request: NextRequest): Promise<NextResponse> {
    const pathname = request.nextUrl.pathname

    // Skip public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Check if route requires protection
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
    if (!isProtected) {
      return NextResponse.next()
    }

    // Extract token
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Validate token
    let payload
    try {
      payload = await jwtService.verify(token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    // Attach user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
}

export const config = {
  matcher: ['/api/:path*'],
}

export default createAuthMiddleware()