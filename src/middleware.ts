import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from './auth/jwt-service'

export interface AuthMiddlewareConfig {
  jwtService: JwtService
  excludePaths?: string[]
}

function matchesExcludePath(path: string, excludePaths: Set<string>): boolean {
  for (const excluded of excludePaths) {
    if (excluded.endsWith('/*')) {
      const prefix = excluded.slice(0, -2)
      if (path.startsWith(prefix)) {
        return true
      }
    } else if (path === excluded) {
      return true
    }
  }
  return false
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const excludePaths = new Set<string>(config.excludePaths ?? [
    '/login',
    '/register',
    '/health',
    '/api/auth/*',
  ])

  async function middleware(request: NextRequest): Promise<NextResponse> {
    const path = request.nextUrl.pathname

    if (matchesExcludePath(path, excludePaths)) {
      return NextResponse.next()
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    let payload
    try {
      payload = await config.jwtService.verify(token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-email', payload.email)
    response.headers.set('x-user-role', payload.role)

    return response
  }

  return middleware
}
