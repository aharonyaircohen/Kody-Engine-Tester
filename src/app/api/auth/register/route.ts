import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { jwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'
import { register } from '@/api/auth/register'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

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
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
