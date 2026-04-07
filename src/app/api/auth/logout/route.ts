import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload as any, jwtService)

    // Invalidate the refresh token in the database
    await authService.logout(user.id)

    return Response.json({ message: 'Logged out successfully' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed'
    return Response.json({ error: message }, { status: 500 })
  }
})