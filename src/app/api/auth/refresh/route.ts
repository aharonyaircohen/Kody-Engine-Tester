import { NextRequest } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'
import { getPayloadInstance } from '@/services/progress'

const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return Response.json({ error: 'Refresh token is required' }, { status: 400 })
    }

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload as any, jwtService)
    const result = await authService.refresh(refreshToken)

    return Response.json(result, { status: 200 })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401
    const message = err instanceof Error ? err.message : 'Refresh failed'
    return Response.json({ error: message }, { status })
  }
}
