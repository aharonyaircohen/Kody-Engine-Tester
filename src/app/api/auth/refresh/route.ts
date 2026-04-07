import { NextRequest } from 'next/server'
import { getAuthService } from '@/middleware/auth-middleware'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return Response.json({ error: 'Refresh token is required' }, { status: 400 })
    }

    const authService = getAuthService()
    const result = await authService.refresh(refreshToken)

    return Response.json(result, { status: 200 })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 401
    const message = err instanceof Error ? err.message : 'Refresh failed'
    return Response.json({ error: message }, { status })
  }
}
