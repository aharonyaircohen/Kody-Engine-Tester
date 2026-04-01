import { NextRequest, NextResponse } from 'next/server'

export interface CorrelationIdConfig {
  headerName?: string
  generator?: () => string
}

const DEFAULT_HEADER = 'X-Correlation-ID'

function defaultGenerator(): string {
  return crypto.randomUUID()
}

export function createCorrelationIdMiddleware(config: CorrelationIdConfig = {}) {
  const headerName = config.headerName ?? DEFAULT_HEADER
  const generator = config.generator ?? defaultGenerator

  return function correlationIdMiddleware(request: NextRequest): NextResponse {
    // Use existing correlation ID if provided, otherwise generate a new one
    const correlationId = request.headers.get(headerName.toLowerCase()) ?? generator()

    // Create response and attach correlation ID header
    const response = NextResponse.next()
    response.headers.set(headerName, correlationId)

    // Store correlation ID on request for downstream use
    // We use a custom header to pass it through since NextRequest is immutable
    const requestWithCorrelation = new NextRequest(request.url, {
      headers: new Headers(request.headers),
    })
    requestWithCorrelation.headers.set(headerName, correlationId)

    return response
  }
}

export function generateCorrelationId(): string {
  return crypto.randomUUID()
}

export { DEFAULT_HEADER }
