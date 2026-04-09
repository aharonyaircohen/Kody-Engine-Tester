import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { UserStore } from '@/auth/user-store'
import { SessionStore } from '@/auth/session-store'
import { JwtService } from '@/auth/jwt-service'

const userStore = new UserStore()
const sessionStore = new SessionStore()
const jwtService = new JwtService()

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const result = await login(
      email,
      password,
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown',
      userStore,
      sessionStore,
      jwtService
    )

    return new Response(JSON.stringify(result), {
      status: 200,
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