import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

function getJwtService(): JwtService {
  return new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
}

function getAuthService(payload: Awaited<ReturnType<typeof getPayloadInstance>>): AuthService {
  return new AuthService(payload, getJwtService())
}

export const POST = async (request: NextRequest) => {
  let body: { email?: string; password?: string; confirmPassword?: string }

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { email, password, confirmPassword } = body

  if (!email || !password || !confirmPassword) {
    return new Response(JSON.stringify({ error: 'Email, password, and confirm password are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await getPayloadInstance()
    const authService = getAuthService(payload)

    const result = await register(
      email,
      password,
      confirmPassword,
      '127.0.0.1',
      request.headers.get('user-agent') ?? 'unknown',
      payload,
      authService
    )

    // Return user data without passwordHash
    const { user } = result
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    return new Response(JSON.stringify({ ...result, user: safeUser }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    const status = err instanceof Error && 'status' in err ? (err as Error & { status: number }).status : 400

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}