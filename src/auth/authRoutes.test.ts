import { describe, it, expect, beforeEach } from 'vitest'
import { AUTH_ROUTES, getRouteHandler } from './authRoutes'
import { AuthController } from './authController'
import { UserStore } from './user-store'
import { SessionStore } from './session-store'
import { JwtService } from './jwt-service'

describe('authRoutes', () => {
  describe('AUTH_ROUTES', () => {
    it('should define login route', () => {
      const loginRoute = AUTH_ROUTES.find((r) => r.path === '/auth/login')
      expect(loginRoute).toBeDefined()
      expect(loginRoute?.method).toBe('POST')
      expect(loginRoute?.handler).toBe('login')
      expect(loginRoute?.requiresAuth).toBe(false)
    })

    it('should define logout route', () => {
      const logoutRoute = AUTH_ROUTES.find((r) => r.path === '/auth/logout')
      expect(logoutRoute).toBeDefined()
      expect(logoutRoute?.method).toBe('POST')
      expect(logoutRoute?.handler).toBe('logout')
      expect(logoutRoute?.requiresAuth).toBe(true)
    })

    it('should define me route', () => {
      const meRoute = AUTH_ROUTES.find((r) => r.path === '/auth/me')
      expect(meRoute).toBeDefined()
      expect(meRoute?.method).toBe('GET')
      expect(meRoute?.handler).toBe('me')
      expect(meRoute?.requiresAuth).toBe(true)
    })

    it('should have 3 routes total', () => {
      expect(AUTH_ROUTES.length).toBe(3)
    })

    it('each route should have required fields', () => {
      for (const route of AUTH_ROUTES) {
        expect(route.path).toBeDefined()
        expect(route.method).toBeDefined()
        expect(route.handler).toBeDefined()
        expect(route.description).toBeDefined()
        expect(typeof route.requiresAuth).toBe('boolean')
      }
    })
  })

  describe('getRouteHandler', () => {
    let userStore: UserStore
    let sessionStore: SessionStore
    let jwtService: JwtService
    let controller: AuthController

    beforeEach(async () => {
      userStore = new UserStore()
      await userStore.ready
      sessionStore = new SessionStore()
      jwtService = new JwtService('test-secret')
      controller = new AuthController(userStore, sessionStore, jwtService)
    })

    describe('login handler', () => {
      it('should return tokens for valid credentials', async () => {
        const handler = getRouteHandler(
          { controller, jwtService },
          'login'
        )

        const request = new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPass1!' }),
        })

        const response = await handler(request)
        expect(response.status).toBe(200)

        const body = await response.json()
        expect(body.accessToken).toBeDefined()
        expect(body.refreshToken).toBeDefined()
        expect(body.user.email).toBe('admin@example.com')
      })

      it('should return error for missing credentials', async () => {
        const handler = getRouteHandler(
          { controller, jwtService },
          'login'
        )

        const request = new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        const response = await handler(request)
        expect(response.status).toBe(400)
      })

      it('should return error for invalid credentials', async () => {
        const handler = getRouteHandler(
          { controller, jwtService },
          'login'
        )

        const request = new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'wrong' }),
        })

        const response = await handler(request)
        expect(response.status).toBe(401)
      })
    })

    describe('me handler', () => {
      it('should return user profile for authenticated request', async () => {
        const loginResult = await controller.login(
          { email: 'admin@example.com', password: 'AdminPass1!' },
          '127.0.0.1',
          'TestAgent'
        )

        const handler = getRouteHandler(
          { controller, jwtService },
          'me'
        )

        const request = new Request('http://localhost/auth/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${loginResult.accessToken}` },
        })

        const response = await handler(request)
        expect(response.status).toBe(200)

        const body = await response.json()
        expect(body.email).toBe('admin@example.com')
        expect(body.role).toBe('admin')
      })

      it('should return 401 without authorization header', async () => {
        const handler = getRouteHandler(
          { controller, jwtService },
          'me'
        )

        const request = new Request('http://localhost/auth/me', {
          method: 'GET',
        })

        const response = await handler(request)
        expect(response.status).toBe(401)
      })
    })
  })
})
