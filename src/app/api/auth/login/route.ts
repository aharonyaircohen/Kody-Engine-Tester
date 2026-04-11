import { NextRequest } from 'next/server'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'
import { email, minLength } from '@/validation/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email: emailValue, password } = body

    // Input validation
    const emailResult = email()(emailValue)
    if (!emailResult.valid) {
      return new Response(JSON.stringify({ error: emailResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const passwordResult = minLength(8)(password)
    if (!passwordResult.valid) {
      return new Response(JSON.stringify({ error: passwordResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload, jwtService)

    const result = await authService.login(emailValue, password, 'unknown', 'unknown')

    return new Response(
      JSON.stringify({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const status = (err as { status?: number }).status || 500
    const message = err instanceof Error ? err.message : 'Login failed'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}