import { NextRequest, NextResponse } from 'next/server'
import { Cache } from '@/utils/cache'

export interface CacheMiddlewareConfig {
  defaultTTL?: number
  maxSize?: number
  keyResolver?: (request: NextRequest) => string | null
  cacheableMethods?: string[]
  cacheNonGet?: boolean
  enableCacheHeaders?: boolean
}

interface CachedResponse {
  body: string
  status: number
  statusText: string
  headers: [string, string][]
}

export class CacheStore {
  private cache: Cache<string, CachedResponse>
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: {
    defaultTTL?: number
    maxSize?: number
    cleanupIntervalMs?: number
  }) {
    this.cache = new Cache<string, CachedResponse>({
      maxSize: config.maxSize,
      defaultTTL: config.defaultTTL,
    })

    const cleanupInterval = config.cleanupIntervalMs ?? 60_000
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval)
    this.cleanupTimer.unref()
  }

  get(key: string): CachedResponse | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: CachedResponse, ttl?: number): void {
    this.cache.set(key, value, ttl)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  cleanup(): void {
    // Cache handles TTL expiry internally on get/has, no-op cleanup needed for in-memory
  }

  reset(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.cache.clear()
  }

  stats() {
    return this.cache.stats()
  }

  get size(): number {
    return this.cache.stats().size
  }
}

async function readBody(response: Response): Promise<string> {
  return response.text()
}

export function createCacheMiddleware(config: CacheMiddlewareConfig = {}) {
  const store = new CacheStore({
    defaultTTL: config.defaultTTL,
    maxSize: config.maxSize,
  })
  const keyResolver = config.keyResolver ?? defaultKeyResolver
  const cacheableMethods = config.cacheableMethods ?? ['GET']
  const cacheNonGet = config.cacheNonGet ?? false
  const enableHeaders = config.enableCacheHeaders ?? true

  async function middleware(
    request: NextRequest,
    originalResponse: Response,
    ttl?: number,
  ): Promise<NextResponse> {
    const method = request.method
    const shouldCache = cacheNonGet ? method !== 'DELETE' : cacheableMethods.includes(method)

    const key = keyResolver(request)
    const hasKey = key !== null

    // Build response with cache headers (if enabled)
    let response: NextResponse
    if (hasKey && shouldCache) {
      const cached = store.get(key)
      if (cached !== undefined) {
        response = new NextResponse(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: cached.headers,
        })
        if (enableHeaders) {
          response.headers.set('X-Cache', 'HIT')
          response.headers.set('X-Cache-Key', key)
        }
        return response
      }

      // Read body and serialize for storage
      const body = await readBody(originalResponse)
      const cachedResponse: CachedResponse = {
        body,
        status: originalResponse.status,
        statusText: originalResponse.statusText,
        headers: Array.from(originalResponse.headers.entries()),
      }

      if (originalResponse.ok) {
        store.set(key, cachedResponse, ttl)
      }

      response = NextResponse.next()
      if (enableHeaders) {
        response.headers.set('X-Cache', 'MISS')
        response.headers.set('X-Cache-Key', key)
      }
    } else {
      // Bypass cache - return original response with MISS header if enabled
      const body = await readBody(originalResponse)
      response = new NextResponse(body, originalResponse)
      if (enableHeaders) {
        response.headers.set('X-Cache', 'MISS')
        if (hasKey) {
          response.headers.set('X-Cache-Key', key)
        }
      }
    }

    return response
  }

  middleware.cache = store
  return middleware
}

function defaultKeyResolver(request: NextRequest): string | null {
  return request.url
}