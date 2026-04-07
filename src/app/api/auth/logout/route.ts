import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getAuthService, getJwtService } from '@/middleware/auth-middleware'

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json().catch(() => ({}))
    const allDevices = body.allDevices === true

    const authHeader = req.headers.get('authorization') ?? ''
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : ''

    const authService = getAuthService()
    const jwtService = getJwtService()

    // Blacklist the access token immediately
    if (accessToken) {
      jwtService.blacklist(accessToken)
    }

    // Clear the refresh token in DB
    if (user?.id) {
      await authService.logout(user.id)
    }

    return Response.json({ success: true }, { status: 200 })
  } catch {
    return Response.json({ error: 'Logout failed' }, { status: 500 })
  }
})
