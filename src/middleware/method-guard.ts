import { NextRequest, NextResponse } from 'next/server'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface MethodGuardConfig {
  allowedMethods: HttpMethod[] | Lowercase<HttpMethod>[]
}

export interface MethodGuard {
  middleware: (request: NextRequest) => NextResponse
}

export function createMethodGuard(config: MethodGuardConfig): MethodGuard {
  const allowedMethods = new Set(config.allowedMethods.map((m) => m.toUpperCase()))

  function middleware(request: NextRequest): NextResponse {
    const method = request.method.toUpperCase()

    if (!allowedMethods.has(method)) {
      const allowed = Array.from(allowedMethods).join(', ')
      return new NextResponse(
        JSON.stringify({
          error: 'Method Not Allowed',
          message: `HTTP ${method} is not allowed. Allowed methods: ${allowed}`,
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            Allow: allowed,
          },
        }
      )
    }

    return NextResponse.next()
  }

  return { middleware }
}
