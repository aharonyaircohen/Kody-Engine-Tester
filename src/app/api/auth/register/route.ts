import { NextRequest } from 'next/server'
import { byIp } from '@/middleware/rate-limiter'
import { registerRateLimiter } from '@/middleware/auth-rate-limiters'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'
import { register as registerUser } from '@/api/auth/register'
import { registerSchema } from '@/validation/auth-schemas'

export async function POST(req: NextRequest): Promise<Response> {
  // Rate limiting — stricter for registration: 5 attempts per 15 minutes per IP
  const key = byIp(req) ?? 'anonymous'
  const rateLimitResult = registerRateLimiter.check(key)

  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          'X-RateLimit-Limit': '5',
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

  // Validate input with Zod
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { email, password, confirmPassword } = parsed.data

  // Initialize Payload and AuthService
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

  // Register via AuthService (PBKDF2, not UserStore)
  let authResult: { accessToken: string; refreshToken: string; user: { id: string | number; email: string; role: string } }
  try {
    authResult = await registerUser(email, password, confirmPassword, '', '', payloadInstance, authService)
  } catch (err) {
    const status = err instanceof Error && 'status' in err ? (err as Error & { status: number }).status : 500
    const message = err instanceof Error ? err.message : 'Registration failed'

    // Email conflict → 409
    if (message === 'Email already in use') {
      return new Response(JSON.stringify({ error: message, code: 409 }), {
        status: 409,
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
