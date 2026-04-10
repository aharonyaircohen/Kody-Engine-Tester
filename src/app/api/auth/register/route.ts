import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    if (!email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and confirm password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ipAddress =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') ?? 'Unknown'

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload, jwtService)

    const result = await register(
      email,
      password,
      confirmPassword,
      ipAddress,
      userAgent,
      payload,
      authService
    )

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const err = error as { message?: string; status?: number }
    return new Response(
      JSON.stringify({ error: err.message ?? 'Registration failed' }),
      { status: err.status ?? 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}