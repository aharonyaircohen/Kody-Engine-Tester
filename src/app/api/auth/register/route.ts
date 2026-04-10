import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    if (!email || !password || !confirmPassword) {
      return new Response(JSON.stringify({ error: 'Email, password, and confirm password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload as any, jwtService)

    const result = await register(email, password, confirmPassword, ipAddress, userAgent, payload, authService)

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as Error & { status?: number }
    const status = error.status ?? 500
    const message = error.message ?? 'Internal server error'

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}