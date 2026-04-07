import { NextRequest } from 'next/server'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload as any, jwtService)

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await authService.login(email, password, ipAddress, userAgent)

    return Response.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    const status = err instanceof Error && 'status' in err ? (err as any).status : 401
    return Response.json({ error: message }, { status })
  }
}