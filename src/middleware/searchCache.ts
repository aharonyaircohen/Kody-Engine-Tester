import { NextRequest, NextResponse } from 'next/server'
import { Cache } from '@/utils/cache'
import { buildSearchCacheKey } from '@/utils/searchHelpers'

export interface SearchCacheConfig {
  ttl: number
  maxSize?: number
}

export interface SearchCacheContext {
  cacheKey: string
  cache: Cache<string, unknown>
}

export function createSearchCacheMiddleware(config: SearchCacheConfig) {
  const cache = new Cache<string, unknown>({
    maxSize: config.maxSize ?? 1000,
    defaultTTL: config.ttl,
  })

  /**
   * Extract search cache key and context from a NextRequest.
   * This can be used by route handlers to interact with the search cache.
   */
  function extractSearchCacheContext(request: NextRequest): SearchCacheContext {
    const { searchParams } = request.nextUrl

    const query = searchParams.get('q') ?? ''
    const collections = searchParams.get('collections')?.split(',').filter(Boolean) ?? []
    const status = searchParams.get('status') ?? undefined
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '10', 10)
    const tagMode = searchParams.get('tagMode') === 'and' ? 'and' : 'or'

    const cacheKey = buildSearchCacheKey(query, { collections, status, tagMode }, { page, limit })

    return { cacheKey, cache }
  }

  function middleware(request: NextRequest): NextResponse {
    const { cacheKey } = extractSearchCacheContext(request)

    // Check if we have a cached response
    const cached = cache.get(cacheKey)
    if (cached !== undefined) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'Content-Type': 'application/json',
        },
      })
    }

    // Set cache key header for route handler to use
    const response = NextResponse.next()
    response.headers.set('X-Cache-Key', cacheKey)
    return response
  }

  middleware.cache = cache
  middleware.extractCacheContext = extractSearchCacheContext
  return middleware
}
