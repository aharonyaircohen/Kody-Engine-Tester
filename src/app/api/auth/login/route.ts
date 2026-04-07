import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'

const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload as any, jwtService)
    const result = await authService.login(
      email,
      password,
      req.headers.get('x-forwarded-for') ?? 'unknown',
      req.headers.get('user-agent') ?? 'unknown'
    )

    return Response.json(result, { status: 200 })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401
    const message = err instanceof Error ? err.message : 'Login failed'
    return Response.json({ error: message }, { status })
  }
}
