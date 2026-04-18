import { NextRequest } from 'next/server'
import { byIp } from '@/middleware/rate-limiter'
import { loginRateLimiter } from '@/middleware/auth-rate-limiters'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'
import { loginSchema } from '@/validation/auth-schemas'

export async function POST(req: NextRequest): Promise<Response> {
  // Rate limiting — 10 attempts per 15 minutes per IP
  const key = byIp(req) ?? 'anonymous'
  const rateLimitResult = loginRateLimiter.check(key)

  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(
            Math.ceil((Date.now() + rateLimitResult.retryAfterMs) / 1000)
          ),
        },
      }
    )
  }

  // Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Validate input
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { email, password } = parsed.data

  // Authenticate via AuthService (PBKDF2, not UserStore)
  let payloadInstance: Awaited<ReturnType<typeof getPayloadInstance>>
  try {
    payloadInstance = await getPayloadInstance()
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  const authService = new AuthService(payloadInstance, jwtService)

  let authResult: { accessToken: string; refreshToken: string; user: { id: string | number; email: string; role: string } }
  try {
    authResult = await authService.login(email, password, '', '')
  } catch (err) {
    const status = err instanceof Error && 'status' in err ? (err as Error & { status: number }).status : 500
    const message = err instanceof Error ? err.message : 'Authentication failed'

    // Map specific error messages to appropriate HTTP status codes
    if (message === 'Invalid credentials' || message === 'Account is inactive') {
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user: authResult.user,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
