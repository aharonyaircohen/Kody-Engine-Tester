import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'

const jwtService = new JwtService()

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const result = await register(
      email,
      password,
      confirmPassword || '',
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown',
      payload,
      authService
    )

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number }
    const status = err.status || 500
    const message = err.message || 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}