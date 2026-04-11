import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { AuthService } from '@/auth/auth-service'
import { jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const result = await register(
      email,
      password,
      confirmPassword ?? password,
      '127.0.0.1',
      'unknown',
      payload,
      authService
    )

    return new Response(
      JSON.stringify({
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
        token: result.accessToken,
        refreshToken: result.refreshToken,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500
    const message = (error as Error).message ?? 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
