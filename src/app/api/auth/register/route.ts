import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { getJwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'
import { register } from '@/api/auth/register'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword, firstName, lastName } = body

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Email, password, confirmPassword, firstName, and lastName are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const payload = await getPayloadInstance()
    const jwtService = getJwtService()
    const authService = new AuthService(payload, jwtService)

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await register(
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      ipAddress,
      userAgent,
      payload,
      authService
    )

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    const status = error.status ?? 500
    return new Response(JSON.stringify({ error: error.message ?? 'Internal server error' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}