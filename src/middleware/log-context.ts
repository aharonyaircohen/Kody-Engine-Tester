import { NextRequest, NextResponse } from 'next/server'

export interface LogContext {
  requestId: string
  timestamp: number
}

export interface LogContextMiddleware {
  middleware: (request: NextRequest) => NextResponse
}

export function createLogContextMiddleware(): LogContextMiddleware {
  function middleware(request: NextRequest): NextResponse {
    const requestId = crypto.randomUUID()
    const timestamp = Date.now()

    // Attach to req.locals for downstream use
    const extendedRequest = request as NextRequest & { locals: Record<string, unknown> }
    extendedRequest.locals = {
      ...extendedRequest.locals,
      requestId,
      timestamp,
    }

    const response = NextResponse.next()
    response.headers.set('x-request-id', requestId)

    return response
  }

  return { middleware }
}