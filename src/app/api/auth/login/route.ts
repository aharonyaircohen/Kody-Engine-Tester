import { NextRequest } from 'next/server'
import { getAuthService } from '@/middleware/auth-middleware'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const authService = getAuthService()
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
