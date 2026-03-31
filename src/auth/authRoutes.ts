import type { AuthController } from './authController'
import type { JwtService } from './jwt-service'

export type AuthMethod = 'POST' | 'GET'

export interface AuthRoute {
  path: string
  method: AuthMethod
  handler: string
  description: string
  requiresAuth: boolean
}

export const AUTH_ROUTES: AuthRoute[] = [
  {
    path: '/auth/login',
    method: 'POST',
    handler: 'login',
    description: 'Authenticate user and create session',
    requiresAuth: false,
  },
  {
    path: '/auth/logout',
    method: 'POST',
    handler: 'logout',
    description: 'Invalidate session and blacklist token',
    requiresAuth: true,
  },
  {
    path: '/auth/me',
    method: 'GET',
    handler: 'me',
    description: 'Get current user profile',
    requiresAuth: true,
  },
]

export interface RouteConfig {
  controller: AuthController
  jwtService: JwtService
}

export function getRouteHandler(
  config: RouteConfig,
  handlerName: 'login' | 'logout' | 'me'
): (request: Request) => Promise<Response> {
  const { controller, jwtService } = config

  switch (handlerName) {
    case 'login':
      return async (request: Request) => {
        const body = await request.json()
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        try {
          const result = await controller.login(body, ip, userAgent)
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const err = error as { message?: string; status?: number }
          return new Response(JSON.stringify({ error: err.message || 'Login failed' }), {
            status: err.status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }

    case 'logout':
      return async (request: Request) => {
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const token = authHeader.slice(7)
        const body = await request.json().catch(() => ({}))

        try {
          const payload = await jwtService.verify(token)
          controller.logout(payload.userId, payload.sessionId || '', token, { allDevices: body.allDevices })
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const err = error as { message?: string; status?: number }
          return new Response(JSON.stringify({ error: err.message || 'Logout failed' }), {
            status: err.status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }

    case 'me':
      return async (request: Request) => {
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const token = authHeader.slice(7)

        try {
          const payload = await jwtService.verify(token)
          const user = await controller.me(payload.userId)
          return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const err = error as { message?: string; status?: number }
          return new Response(JSON.stringify({ error: err.message || 'Failed to get user' }), {
            status: err.status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }
  }
}
