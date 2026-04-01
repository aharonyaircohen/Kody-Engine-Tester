import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createMiddlewarePipeline,
  createPipelineAuthMiddleware,
  createPipelineRoleGuard,
  createRouteHandler,
  createAuthenticatedRoute,
  createEditorRoute,
  createAdminRoute,
  createPublicRoute,
  PipelineContext,
} from './pipeline'
import { UserStore } from '../auth/user-store'
import { SessionStore } from '../auth/session-store'
import { JwtService } from '../auth/jwt-service'

describe('Pipeline', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')
  })

  async function makeAuthenticatedContext() {
    const user = await userStore.findByEmail('viewer@example.com')
    const accessToken = await jwtService.signAccessToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
      sessionId: 'session-1',
      generation: 0,
    })
    const refreshToken = await jwtService.signRefreshToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
      sessionId: 'session-1',
      generation: 0,
    })
    const session = sessionStore.create(user!.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')
    return { user: user!, accessToken, session }
  }

  describe('createMiddlewarePipeline', () => {
    it('should compose multiple middleware functions in order', async () => {
      const callOrder: string[] = []
      const request = new NextRequest('http://localhost')

      const middleware1 = async (context: PipelineContext) => {
        callOrder.push('first')
        return context
      }

      const middleware2 = async (context: PipelineContext) => {
        callOrder.push('second')
        return context
      }

      const middleware3 = async (context: PipelineContext) => {
        callOrder.push('third')
        return context
      }

      const pipeline = createMiddlewarePipeline(middleware1, middleware2, middleware3)
      const result = await pipeline({ request })

      expect(result).not.toBeInstanceOf(NextResponse)
      expect(callOrder).toEqual(['first', 'second', 'third'])
    })

    it('should short-circuit on NextResponse', async () => {
      const middleware1 = async (_context: PipelineContext) => {
        return new NextResponse('first', { status: 200 })
      }

      const middleware2 = async (_context: PipelineContext) => {
        throw new Error('Should not reach middleware2')
      }

      const pipeline = createMiddlewarePipeline(middleware1, middleware2)
      const result = await pipeline({ request: new NextRequest('http://localhost') })

      expect(result).toBeInstanceOf(NextResponse)
      expect((result as NextResponse).status).toBe(200)
    })

    it('should pass modified context to subsequent middleware', async () => {
      const middleware1 = (context: PipelineContext) => {
        return { ...context, extra: 1 } as PipelineContext & { extra: number }
      }

      const middleware2 = (context: PipelineContext) => {
        const ctx = context as PipelineContext & { extra: number }
        return { ...context, extra: ctx.extra + 10 } as PipelineContext & { extra: number }
      }

      const pipeline = createMiddlewarePipeline(middleware1, middleware2)
      const result = await pipeline({ request: new NextRequest('http://localhost') })

      expect(result).not.toBeInstanceOf(NextResponse)
      expect((result as PipelineContext & { extra: number }).extra).toBe(11)
    })
  })

  describe('createPipelineAuthMiddleware', () => {
    it('should add user and session to context on valid token', async () => {
      const { user, accessToken, session } = await makeAuthenticatedContext()
      const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)

      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })

      const context = { request }
      const result = await authMiddleware(context)

      expect(result).not.toBeInstanceOf(NextResponse)
      const ctx = result as { user: { id: string }; session: { id: string } }
      expect(ctx.user.id).toBe(user.id)
      expect(ctx.session.id).toBe(session.id)
    })

    it('should return 401 when no token provided', async () => {
      const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
      const request = new NextRequest('http://localhost')
      const context = { request }
      const result = await authMiddleware(context)

      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(401)
    })

    it('should return 401 for invalid token', async () => {
      const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
      const request = new NextRequest('http://localhost', {
        headers: { authorization: 'Bearer invalid-token' },
      })
      const context = { request }
      const result = await authMiddleware(context)

      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(401)
    })
  })

  describe('createPipelineRoleGuard', () => {
    it('should allow user with required role', async () => {
      const { user, accessToken } = await makeAuthenticatedContext()
      const roleGuard = createPipelineRoleGuard('viewer')

      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })

      const context = { request, user }
      const result = await roleGuard(context)

      expect(result).not.toBeInstanceOf(NextResponse)
      expect(result).toEqual(context)
    })

    it('should return 403 when user lacks required role', async () => {
      const { user, accessToken } = await makeAuthenticatedContext()
      const roleGuard = createPipelineRoleGuard('admin')

      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })

      const context = { request, user }
      const result = await roleGuard(context)

      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(403)
    })

    it('should return 401 when no user in context', async () => {
      const roleGuard = createPipelineRoleGuard('admin')
      const request = new NextRequest('http://localhost')
      const context = { request }
      const result = await roleGuard(context)

      expect(result).toBeInstanceOf(NextResponse)
      const response = result as NextResponse
      expect(response.status).toBe(401)
    })
  })

  describe('createRouteHandler', () => {
    it('should execute handler after passing through pipeline', async () => {
      const handlerCalled = { value: false }

      const handler = async () => {
        handlerCalled.value = true
        return new NextResponse('success', { status: 200 })
      }

      const route = createRouteHandler([], handler)
      const request = new NextRequest('http://localhost')
      const response = await route(request)

      expect(handlerCalled.value).toBe(true)
      expect(response.status).toBe(200)
    })

    it('should short-circuit if middleware returns response', async () => {
      const handlerCalled = { value: false }

      const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
      const handler = async () => {
        handlerCalled.value = true
        return new NextResponse('success', { status: 200 })
      }

      const route = createRouteHandler([authMiddleware], handler)
      const request = new NextRequest('http://localhost')
      const response = await route(request)

      expect(handlerCalled.value).toBe(false)
      expect(response.status).toBe(401)
    })
  })

  describe('createAuthenticatedRoute', () => {
    it('should execute handler for authenticated user', async () => {
      const { accessToken } = await makeAuthenticatedContext()

      const handler = async (context: { user: { id: string } }) => {
        return new NextResponse(JSON.stringify({ userId: context.user.id }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const route = createAuthenticatedRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      const response = await route(request)

      expect(response.status).toBe(200)
    })

    it('should return 401 for unauthenticated request', async () => {
      const handler = async () => new NextResponse('success')
      const route = createAuthenticatedRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost')
      const response = await route(request)

      expect(response.status).toBe(401)
    })
  })

  describe('createEditorRoute', () => {
    it('should execute handler for editor', async () => {
      const editor = await userStore.findByEmail('editor@example.com')
      const accessToken = await jwtService.signAccessToken({
        userId: editor!.id,
        email: editor!.email,
        role: editor!.role,
        sessionId: 'session-1',
        generation: 0,
      })
      const refreshToken = await jwtService.signRefreshToken({
        userId: editor!.id,
        email: editor!.email,
        role: editor!.role,
        sessionId: 'session-1',
        generation: 0,
      })
      sessionStore.create(editor!.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')

      const handler = async (context: { user: { id: string } }) => {
        return new NextResponse(JSON.stringify({ userId: context.user.id }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const route = createEditorRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      const response = await route(request)

      expect(response.status).toBe(200)
    })

    it('should return 403 for non-editor user', async () => {
      const { accessToken } = await makeAuthenticatedContext()

      const handler = async () => new NextResponse('success')
      const route = createEditorRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      const response = await route(request)

      expect(response.status).toBe(403)
    })

    it('should return 401 for unauthenticated request', async () => {
      const handler = async () => new NextResponse('success')
      const route = createEditorRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost')
      const response = await route(request)

      expect(response.status).toBe(401)
    })
  })

  describe('createAdminRoute', () => {
    it('should execute handler for admin', async () => {
      const admin = await userStore.findByEmail('admin@example.com')
      const accessToken = await jwtService.signAccessToken({
        userId: admin!.id,
        email: admin!.email,
        role: admin!.role,
        sessionId: 'session-1',
        generation: 0,
      })
      const refreshToken = await jwtService.signRefreshToken({
        userId: admin!.id,
        email: admin!.email,
        role: admin!.role,
        sessionId: 'session-1',
        generation: 0,
      })
      sessionStore.create(admin!.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')

      const handler = async (context: { user: { id: string } }) => {
        return new NextResponse(JSON.stringify({ userId: context.user.id }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const route = createAdminRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      const response = await route(request)

      expect(response.status).toBe(200)
    })

    it('should return 403 for non-admin user', async () => {
      const { accessToken } = await makeAuthenticatedContext()

      const handler = async () => new NextResponse('success')
      const route = createAdminRoute(userStore, sessionStore, jwtService, handler)
      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      const response = await route(request)

      expect(response.status).toBe(403)
    })
  })

  describe('createPublicRoute', () => {
    it('should execute handler without authentication', async () => {
      const handlerCalled = { value: false }

      const handler = async () => {
        handlerCalled.value = true
        return new NextResponse('public endpoint', { status: 200 })
      }

      const route = createPublicRoute(handler)
      const request = new NextRequest('http://localhost')
      const response = await route(request)

      expect(handlerCalled.value).toBe(true)
      expect(response.status).toBe(200)
    })
  })

  describe('pipeline composition', () => {
    it('should compose auth + role guard in correct order', async () => {
      const { accessToken } = await makeAuthenticatedContext()
      const callOrder: string[] = []

      const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
      const roleGuard = createPipelineRoleGuard('admin')

      const pipeline = createMiddlewarePipeline(
        async (context) => {
          callOrder.push('auth-start')
          const result = await authMiddleware(context)
          callOrder.push('auth-end')
          return result
        },
        async (context) => {
          callOrder.push('role-start')
          const result = roleGuard(context)
          callOrder.push('role-end')
          return result
        }
      )

      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })

      const result = await pipeline({ request })

      expect(result).toBeInstanceOf(NextResponse)
      expect((result as NextResponse).status).toBe(403)
      expect(callOrder).toEqual(['auth-start', 'auth-end', 'role-start', 'role-end'])
    })

    it('should allow editor through editor route', async () => {
      const editor = await userStore.findByEmail('editor@example.com')
      const accessToken = await jwtService.signAccessToken({
        userId: editor!.id,
        email: editor!.email,
        role: editor!.role,
        sessionId: 'session-1',
        generation: 0,
      })
      const refreshToken = await jwtService.signRefreshToken({
        userId: editor!.id,
        email: editor!.email,
        role: editor!.role,
        sessionId: 'session-1',
        generation: 0,
      })
      sessionStore.create(editor!.id, accessToken, refreshToken, '127.0.0.1', 'TestAgent')

      const route = createEditorRoute(userStore, sessionStore, jwtService, async (ctx) => {
        return new NextResponse(JSON.stringify({ role: ctx.user.role }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      })

      const request = new NextRequest('http://localhost', {
        headers: { authorization: `Bearer ${accessToken}` },
      })

      const response = await route(request)
      expect(response.status).toBe(200)
    })
  })
})
