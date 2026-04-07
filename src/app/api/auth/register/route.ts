import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { jwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json()
    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)
    const result = await register(email, password, password, '0.0.0.0', request.headers.get('user-agent') ?? '', payload, authService)
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const status = error?.status ?? 500
    const message = error?.message ?? 'Internal server error'
    // Per task AC: duplicate email returns 400, not 409
    const finalStatus = error?.message === 'Email already in use' ? 400 : status
    return new Response(JSON.stringify({ error: message }), { status: finalStatus, headers: { 'Content-Type': 'application/json' } })
  }
}