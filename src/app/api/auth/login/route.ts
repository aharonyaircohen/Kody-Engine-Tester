import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { jwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const result = await authService.login(
      email,
      password,
      ipAddress,
      userAgent
    )

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}