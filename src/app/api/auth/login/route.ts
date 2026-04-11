import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await login(email, password, '127.0.0.1', 'unknown', userStore, sessionStore, jwtService)

    return new Response(
      JSON.stringify({
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
        token: result.accessToken,
        refreshToken: result.refreshToken,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
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
