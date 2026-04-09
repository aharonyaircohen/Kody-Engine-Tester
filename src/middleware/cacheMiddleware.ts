import { NextRequest, NextResponse } from 'next/server'
import { CacheManager } from '@/cache/cacheManager'

export interface CacheMiddlewareConfig {
  cacheManager: CacheManager
  keyResolver: (request: NextRequest) => string | null
  ttl?: number
  condition?: (request: NextRequest) => boolean
  cacheResponseBody?: boolean
}

export interface CacheMiddleware {
  (request: NextRequest): Promise<NextResponse>
  cacheManager: CacheManager
}

export function createCacheMiddleware(config: CacheMiddlewareConfig): CacheMiddleware {
  const { cacheManager, keyResolver, ttl, condition, cacheResponseBody = true } = config

  async function middleware(request: NextRequest): Promise<NextResponse> {
    if (condition && !condition(request)) {
      return NextResponse.next()
    }

    const key = keyResolver(request)
    if (!key) {
      return NextResponse.next()
    }

    const cachedResult = await cacheManager.get(key)
    if (cachedResult.isOk() && cachedResult.value !== undefined) {
      const cached = cachedResult.value
      const data = cacheResponseBody ? JSON.parse(cached) : null
      const response = new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      })
      return response
    }

    const response = await NextResponse.next()
    response.headers.set('X-Cache', 'MISS')

    const originalBody = response.body
    if (originalBody && cacheResponseBody) {
      const bodyText = await streamToString(originalBody)
      try {
        const bodyJson = JSON.parse(bodyText)
        await cacheManager.set(key, JSON.stringify(bodyJson), ttl)
      } catch {
        // Non-JSON response or cache set failed - skip caching
      }
    }

    return response
  }

  middleware.cacheManager = cacheManager
  return middleware
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }
  result += decoder.decode()
  return result
}

export function byPath(pathPattern: string | RegExp): (request: NextRequest) => string | null {
  return (request: NextRequest): string | null => {
    const url = request.nextUrl.pathname
    if (typeof pathPattern === 'string') {
      return url.includes(pathPattern) ? `path:${url}` : null
    }
    return pathPattern.test(url) ? `path:${url}` : null
  }
}

export function byQueryParam(param: string): (request: NextRequest) => string | null {
  return (request: NextRequest): string | null => {
    const value = request.nextUrl.searchParams.get(param)
    return value ? `query:${param}=${value}` : null
  }
}

export function byMethod(method: string): (request: NextRequest) => string | null {
  return (request: NextRequest): string | null => {
    return request.method === method ? `method:${method}` : null
  }
}

export function and(
  ...resolvers: Array<(request: NextRequest) => string | null>
): (request: NextRequest) => string | null {
  return (request: NextRequest): string | null => {
    const parts: string[] = []
    for (const resolver of resolvers) {
      const result = resolver(request)
      if (!result) return null
      parts.push(result)
    }
    return parts.join(':')
  }
}

export function or(
  ...resolvers: Array<(request: NextRequest) => string | null>
): (request: NextRequest) => string | null {
  return (request: NextRequest): string | null => {
    for (const resolver of resolvers) {
      const result = resolver(request)
      if (result) return result
    }
    return null
  }
}
