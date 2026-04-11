import { NextRequest, NextResponse } from 'next/server'

export interface ContentTypeGuardConfig {
  allowedTypes?: string[]
}

const DEFAULT_ALLOWED_TYPES = ['application/json', 'multipart/form-data']

export function createContentTypeGuard(config: ContentTypeGuardConfig = {}) {
  const allowedTypes = config.allowedTypes ?? DEFAULT_ALLOWED_TYPES

  function middleware(request: NextRequest): NextResponse {
    const contentType = request.headers.get('content-type') ?? ''
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(request.method)

    if (hasBody && !contentType) {
      return new NextResponse(
        JSON.stringify({ error: 'Content-Type header is required for requests with a body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    if (hasBody && contentType) {
      const matchesAllowed = allowedTypes.some((type) => contentType.startsWith(type))
      if (!matchesAllowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    }

    return NextResponse.next()
  }

  return { middleware }
}