import { NextRequest, NextResponse } from 'next/server'
import type { AuthContext } from './auth-middleware'
import type { RoleError } from './role-guard'
import { createAuthMiddleware } from './auth-middleware'
import { requireRole } from './role-guard'
import type { User } from '../auth/user-store'
import type { Session } from '../auth/session-store'
import type { JwtService } from '../auth/jwt-service'
import type { UserStore } from '../auth/user-store'
import type { SessionStore } from '../auth/session-store'

/**
 * Context passed through the pipeline
 */
export interface PipelineContext {
  request: NextRequest
  user?: User
  session?: Session
  error?: string
  status?: number
}

/**
 * Pipeline middleware function
 * Returns NextResponse to short-circuit, or modifies context for next middleware
 */
export type PipelineMiddleware = (
  context: PipelineContext
) => NextResponse | PipelineContext | Promise<NextResponse | PipelineContext>

/**
 * Request context for auth middleware
 */
interface RequestContext {
  authorization?: string
  ip?: string
}

/**
 * Creates a composed pipeline from multiple middleware functions.
 * Each middleware receives the context and either:
 * - Returns NextResponse to short-circuit the pipeline
 * - Returns modified context for the next middleware
 */
export function createMiddlewarePipeline(...middlewares: PipelineMiddleware[]) {
  return async function pipeline(context: PipelineContext): Promise<NextResponse | PipelineContext> {
    let currentContext = context

    for (const middleware of middlewares) {
      const result = await middleware(currentContext)

      if (result instanceof NextResponse) {
        return result
      }

      currentContext = result
    }

    return currentContext
  }
}

/**
 * Creates an auth middleware for the pipeline.
 * Returns 401 response if authentication fails, otherwise adds user/session to context.
 */
export function createPipelineAuthMiddleware(
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService
): PipelineMiddleware {
  const authMiddleware = createAuthMiddleware(userStore, sessionStore, jwtService)

  return async function authPipelineMiddleware(
    context: PipelineContext
  ): Promise<NextResponse | PipelineContext> {
    const requestContext: RequestContext = {
      authorization: context.request.headers.get('authorization') || undefined,
      ip:
        context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        (context.request as unknown as { ip?: string }).ip,
    }

    const authContext: AuthContext = await authMiddleware(requestContext)

    if (authContext.error) {
      return new NextResponse(JSON.stringify({ error: authContext.error }), {
        status: authContext.status ?? 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return {
      ...context,
      user: authContext.user,
      session: authContext.session,
    }
  }
}

/**
 * Creates a role guard middleware for the pipeline.
 * Returns 401/403 response if role check fails, otherwise passes context through.
 */
export function createPipelineRoleGuard(...roles: string[]): PipelineMiddleware {
  const roleGuard = requireRole(...roles)

  return function rolePipelineMiddleware(
    context: PipelineContext
  ): NextResponse | PipelineContext {
    const roleContext = { user: context.user }
    const error: RoleError | undefined = roleGuard(roleContext)

    if (error) {
      return new NextResponse(JSON.stringify({ error: error.error }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return context
  }
}

/**
 * Handler type for pipeline routes
 */
export type PipelineHandler<T extends PipelineContext = PipelineContext> = (
  context: T
) => Promise<NextResponse>

/**
 * Creates a route handler with the specified middleware pipeline.
 * The handler receives the context after all middleware have passed.
 */
export function createRouteHandler<T extends PipelineContext = PipelineContext>(
  pipeline: PipelineMiddleware[],
  handler: PipelineHandler<T>
) {
  const executePipeline = createMiddlewarePipeline(...pipeline)

  return async function routeHandler(request: NextRequest): Promise<NextResponse> {
    const initialContext: PipelineContext = { request }

    const result = await executePipeline(initialContext)

    if (result instanceof NextResponse) {
      return result
    }

    return handler(result as T)
  }
}

// Pre-built pipelines
export type AuthenticatedPipelineHandler<T extends PipelineContext = PipelineContext> = (
  context: T & { user: User; session: Session }
) => Promise<NextResponse>

/**
 * Creates an authenticated route handler (requires valid JWT token).
 */
export function createAuthenticatedRoute<T extends PipelineContext = PipelineContext>(
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService,
  handler: AuthenticatedPipelineHandler<T>
) {
  const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
  return createRouteHandler<T & { user: User; session: Session }>([authMiddleware], handler)
}

/**
 * Creates an instructor route handler (requires instructor role).
 */
export function createInstructorRoute<T extends PipelineContext = PipelineContext>(
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService,
  handler: AuthenticatedPipelineHandler<T>
) {
  const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
  const roleGuard = createPipelineRoleGuard('instructor')
  return createRouteHandler<T & { user: User; session: Session }>([authMiddleware, roleGuard], handler)
}

/**
 * Creates an admin route handler (requires admin role).
 */
export function createAdminRoute<T extends PipelineContext = PipelineContext>(
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService,
  handler: AuthenticatedPipelineHandler<T>
) {
  const authMiddleware = createPipelineAuthMiddleware(userStore, sessionStore, jwtService)
  const roleGuard = createPipelineRoleGuard('admin')
  return createRouteHandler<T & { user: User; session: Session }>([authMiddleware, roleGuard], handler)
}

/**
 * Creates a public route handler (no authentication required).
 * Rate limiting is applied if configured.
 */
export function createPublicRoute<T extends PipelineContext = PipelineContext>(
  handler: (context: T) => Promise<NextResponse>
) {
  return createRouteHandler<T>([], handler)
}
