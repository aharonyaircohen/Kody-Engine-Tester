import { NextRequest, NextResponse } from 'next/server'

export enum CacheControlType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  NO_STORE = 'no-store',
}

export interface CacheControlConfig {
  defaultType?: CacheControlType
  etag?: boolean
  varyAcceptEncoding?: boolean
}

export function generateETag(body: string): string {
  let hash = 0
  for (let i = 0; i < body.length; i++) {
    const char = body.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `"${hex}"`
}

export function createCacheControlMiddleware(config: CacheControlConfig = {}) {
  const defaultType = config.defaultType ?? CacheControlType.PUBLIC
  const enableEtag = config.etag ?? false
  const varyAcceptEncoding = config.varyAcceptEncoding ?? false

  function middleware(request: NextRequest): NextResponse {
    if (enableEtag) {
      // Generate deterministic ETag based on URL path
      const etag = generateETag(request.nextUrl.pathname)
      const ifNoneMatch = request.headers.get('If-None-Match')

      // Check if client's If-None-Match matches our ETag
      if (ifNoneMatch && ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 })
      }

      const response = NextResponse.next()
      response.headers.set('Cache-Control', defaultType)
      response.headers.set('ETag', etag)

      if (varyAcceptEncoding) {
        response.headers.set('Vary', 'Accept-Encoding')
      }

      return response
    }

    const response = NextResponse.next()
    response.headers.set('Cache-Control', defaultType)

    if (varyAcceptEncoding) {
      response.headers.set('Vary', 'Accept-Encoding')
    }

    return response
  }

  return middleware
}
