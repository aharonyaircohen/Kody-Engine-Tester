import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json()
    const result = await login(email, password, '0.0.0.0', request.headers.get('user-agent') ?? '', userStore, sessionStore, jwtService)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? 'Internal server error'
    return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } })
  }
}