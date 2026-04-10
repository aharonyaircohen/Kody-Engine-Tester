import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ipAddress =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') ?? 'Unknown'

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
  } catch (error) {
    const err = error as { message?: string; status?: number }
    return new Response(
      JSON.stringify({ error: err.message ?? 'Login failed' }),
      { status: err.status ?? 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}