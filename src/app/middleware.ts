import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import type { TokenPayload } from '@/auth/jwt-service'
import type { AuthenticatedUser } from '@/auth/auth-service'

const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['/api/notes', '/api/dashboard', '/api/gradebook']

/**
 * Routes that are always public (no auth required)
 */
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/refresh', '/api/health', '/api/courses/search']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Skip non-protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 }
    )
  }

  let payload: TokenPayload
  try {
    payload = await jwtService.verify(token)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    return NextResponse.json({ error: message }, { status: 401 })
  }

  // Attach user info to request headers for downstream handlers
  const user: AuthenticatedUser = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    isActive: true,
  }

  // Create modified request with user info in headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', String(user.id))
  requestHeaders.set('x-user-email', user.email)
  requestHeaders.set('x-user-role', user.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}