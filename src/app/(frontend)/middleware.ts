import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import { extractBearerToken } from '@/auth/_auth'

const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

/**
 * Routes that require authentication.
 * These routes redirect to /login if no valid token is present.
 */
const PROTECTED_ROUTES = ['/dashboard', '/instructor', '/notes']

/**
 * Routes that are always public (no auth required).
 */
const PUBLIC_ROUTES = ['/', '/login', '/register']

function isProtectedRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
    ? false
    : PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(request: NextRequest): Promise<Response> {
  const { pathname } = request.nextUrl

  // Allow public routes without authentication
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // Extract Bearer token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    return createUnauthorizedResponse('Missing or invalid Authorization header')
  }

  // Verify the JWT token
  let payload
  try {
    payload = await jwtService.verify(token)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid token'
    return createUnauthorizedResponse(message)
  }

  // Token is valid - attach user context to request headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

function createUnauthorizedResponse(message: string): Response {
  return Response.json({ error: message }, { status: 401 })
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public/)
     * - api routes (api/)
     * - Payload admin routes (admin/)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/|admin/).*)',
  ],
}
