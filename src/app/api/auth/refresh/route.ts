import { NextRequest } from 'next/server'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return Response.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload as any, jwtService)

    const result = await authService.refresh(refreshToken)

    return Response.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token refresh failed'
    const status = err instanceof Error && 'status' in err ? (err as any).status : 401
    return Response.json({ error: message }, { status })
  }
}