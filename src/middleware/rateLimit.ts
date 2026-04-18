import { NextRequest, NextResponse } from 'next/server'
import { byIp } from './rate-limiter'

export interface SimpleRateLimitConfig {
  maxRequests: number
  windowMs: number
  cleanupIntervalMs?: number
}

export interface SimpleRateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export class SimpleRateLimiter {
  private store = new Map<string, { count: number; windowStart: number }>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private maxRequests: number
  private windowMs: number

  constructor(config: SimpleRateLimitConfig) {
    this.maxRequests = config.maxRequests
    this.windowMs = config.windowMs

    const cleanupInterval = config.cleanupIntervalMs ?? 60_000
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval)
    this.cleanupTimer.unref()
  }

  check(key: string): SimpleRateLimitResult {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now - entry.windowStart >= this.windowMs) {
      // No entry or window expired — start a fresh window
      this.store.set(key, { count: 1, windowStart: now })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        retryAfterMs: 0,
      }
    }

    if (entry.count < this.maxRequests) {
      entry.count++
      return {
        allowed: true,
        remaining: this.maxRequests - entry.count,
        retryAfterMs: 0,
      }
    }

    // Over limit — compute time until window resets
    const retryAfterMs = entry.windowStart + this.windowMs - now
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now - entry.windowStart >= this.windowMs) {
        this.store.delete(key)
      }
    }
  }

  reset(key?: string): void {
    if (key) {
      this.store.delete(key)
    } else {
      this.store.clear()
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}

export interface RateLimitMiddlewareConfig extends SimpleRateLimitConfig {
  keyResolver?: (request: NextRequest) => string | null
  message?: string
  ipWhitelist?: string[]
  ipBlacklist?: string[]
  enableRateLimitHeaders?: boolean
}

function setRateLimitHeaders(
  response: NextResponse,
  maxRequests: number,
  remaining: number,
  retryAfterMs: number,
  enable: boolean,
): void {
  response.headers.set('X-RateLimit-Limit', String(maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  if (enable) {
    response.headers.set('X-RateLimit-Reset', String(Math.ceil((Date.now() + retryAfterMs) / 1000)))
  }
}

export function createRateLimitMiddleware(config: RateLimitMiddlewareConfig) {
  const limiter = new SimpleRateLimiter(config)
  const keyResolver = config.keyResolver ?? byIp
  const message = config.message ?? 'Too Many Requests'
  const enableHeaders = config.enableRateLimitHeaders ?? true

  function middleware(request: NextRequest): NextResponse {
    const key = keyResolver(request)
    if (!key) return NextResponse.next()

    // IP blacklist — 403 immediately
    if (config.ipBlacklist?.length && config.ipBlacklist.includes(key)) {
      if (config.ipWhitelist?.length && config.ipWhitelist.includes(key)) {
        return NextResponse.next()
      }
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // IP whitelist — bypass rate limiting
    if (config.ipWhitelist?.length && config.ipWhitelist.includes(key)) {
      const response = NextResponse.next()
      setRateLimitHeaders(response, config.maxRequests, config.maxRequests, 0, enableHeaders)
      return response
    }

    const result = limiter.check(key)

    if (result.allowed) {
      const response = NextResponse.next()
      setRateLimitHeaders(
        response,
        config.maxRequests,
        result.remaining,
        result.retryAfterMs,
        enableHeaders,
      )
      return response
    }

    const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000)
    const response = new NextResponse(JSON.stringify({ error: message }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    })
    setRateLimitHeaders(
      response,
      config.maxRequests,
      result.remaining,
      result.retryAfterMs,
      enableHeaders,
    )
    return response
  }

  middleware.limiter = limiter
  return middleware
}
