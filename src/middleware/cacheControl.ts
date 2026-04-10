import { NextRequest, NextResponse } from 'next/server'

export type CachePolicy = 'no-store' | 'no-cache' | 'max-age' | 'private'

export interface CacheControlConfig {
  cachePolicy: CachePolicy
  maxAge?: number
  staleWhileRevalidate?: number
}

function buildCacheControlHeader(config: CacheControlConfig): string {
  switch (config.cachePolicy) {
    case 'no-store':
      return 'no-store'
    case 'no-cache':
      return 'no-cache'
    case 'private':
      return 'private'
    case 'max-age':
      if (config.staleWhileRevalidate) {
        return `max-age=${config.maxAge ?? 0}, stale-while-revalidate=${config.staleWhileRevalidate}`
      }
      return `max-age=${config.maxAge ?? 0}`
  }
}

export async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function generateETag(content: string): Promise<string> {
  const hash = await generateHash(content)
  return `W/"${hash}"`
}

export function createCacheControlMiddleware(config: CacheControlConfig) {
  async function middleware(request: NextRequest, content: string): Promise<NextResponse> {
    const ifNoneMatch = request.headers.get('If-None-Match')
    const ifModifiedSince = request.headers.get('If-Modified-Since')

    // Generate ETag and Last-Modified
    const etag = await generateETag(content)
    const lastModified = new Date().toUTCString()

    // Check conditional requests
    // Per HTTP spec, when both If-None-Match and If-Modified-Since are present,
    // the server MUST NOT return 304 unless both conditions are met
    if (ifNoneMatch && ifModifiedSince) {
      const etagMatches = ifNoneMatch === etag || ifNoneMatch === '*'
      const modifiedSinceDate = new Date(ifModifiedSince)
      const lastModifiedDate = new Date(lastModified)
      const notModifiedSince = lastModifiedDate <= modifiedSinceDate

      if (etagMatches && notModifiedSince) {
        return new NextResponse(null, { status: 304 })
      }
    } else if (ifNoneMatch) {
      if (ifNoneMatch === etag || ifNoneMatch === '*') {
        return new NextResponse(null, { status: 304 })
      }
    } else if (ifModifiedSince) {
      const modifiedSinceDate = new Date(ifModifiedSince)
      const lastModifiedDate = new Date(lastModified)

      if (lastModifiedDate <= modifiedSinceDate) {
        return new NextResponse(null, { status: 304 })
      }
    }

    // Build response with cache headers
    const cacheControl = buildCacheControlHeader(config)
    const response = new NextResponse(content)
    response.headers.set('Cache-Control', cacheControl)
    response.headers.set('ETag', etag)
    response.headers.set('Last-Modified', lastModified)

    return response
  }

  return middleware
}