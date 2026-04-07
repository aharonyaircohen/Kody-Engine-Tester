import { NextRequest } from 'next/server'
import { createAuthMiddleware } from '@/middleware/auth-middleware'
import { userStore, sessionStore, jwtService } from '@/auth'

const authMiddleware = createAuthMiddleware(userStore, sessionStore, jwtService)

export const GET = async (request: NextRequest) => {
  const authContext = await authMiddleware({
    authorization: request.headers.get('authorization') ?? undefined,
    ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown',
  })

  if (authContext.error) {
    return new Response(JSON.stringify({ error: authContext.error }), {
      status: authContext.status ?? 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}