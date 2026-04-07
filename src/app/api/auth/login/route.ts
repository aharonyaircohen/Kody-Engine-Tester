import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '@/auth'
import { login } from '@/api/auth/login'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await login(
      email,
      password,
      ipAddress,
      userAgent,
      userStore,
      sessionStore,
      jwtService
    )

    return new Response(JSON.stringify(result), {
      status: 200,
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
