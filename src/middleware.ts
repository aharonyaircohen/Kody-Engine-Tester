import { NextRequest, NextResponse } from 'next/server'
import { createAuthMiddleware } from '@/middleware/auth-middleware'
import { UserStore } from '@/auth/user-store'
import { SessionStore } from '@/auth/session-store'
import { JwtService } from '@/auth/jwt-service'

// Module-level singleton instances
const userStore = new UserStore()
const sessionStore = new SessionStore()
const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

// Create the auth middleware handler
const authHandler = createAuthMiddleware(userStore, sessionStore, jwtService)

// Routes that require authentication
const PROTECTED_PATHS = ['/api/enroll', '/api/notes', '/api/quizzes', '/api/gradebook', '/api/dashboard', '/api/notifications']

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(protectedPath =>
    pathname.startsWith(protectedPath)
  )
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Only run on protected paths
  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const authorization = request.headers.get('authorization') ?? undefined

  const result = await authHandler({ authorization, ip })

  if (result.error || result.status) {
    const status = result.status ?? 401
    return NextResponse.json(
      { error: result.error ?? 'Unauthorized' },
      { status }
    )
  }

  // Attach user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers)
  if (result.user) {
    requestHeaders.set('x-user-id', result.user.id)
    requestHeaders.set('x-user-email', result.user.email)
    requestHeaders.set('x-user-role', result.user.role)
  }

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
     * - public files (public/*)
     * - Payload CMS files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/graphql|api/graphql-playground).*)',
  ],
}
