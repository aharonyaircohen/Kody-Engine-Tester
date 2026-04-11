import { UserStore } from '../auth/user-store'
import { JwtService } from '../auth/jwt-service'
import type { User } from '../auth/user-store'
import type { RbacRole } from '../auth/_auth'

export interface AuthContext {
  user?: User
  roles?: RbacRole[]
  error?: string
  status?: number
}

interface RequestContext {
  authorization?: string
  ip?: string
}

const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW_MS = 60 * 1000

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Creates a stateless JWT-based authentication middleware.
 *
 * Unlike session-based auth, this validates the JWT directly without checking
 * a session store. The JWT payload contains all necessary user information.
 *
 * @param userStore - User store for looking up user existence and status
 * @param jwtService - JWT service for verifying tokens
 */
export function createAuthMiddleware(
  userStore: UserStore,
  jwtService: JwtService
) {
  const rateLimitMap = new Map<string, RateLimitEntry>()

  return async function authMiddleware(req: RequestContext): Promise<AuthContext> {
    const ip = req.ip ?? 'unknown'

    // Rate limiting
    const now = Date.now()
    let entry = rateLimitMap.get(ip)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
      rateLimitMap.set(ip, entry)
    }
    entry.count++
    if (entry.count > RATE_LIMIT_MAX) {
      return { error: 'Too many requests', status: 429 }
    }

    const authHeader = req.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid Authorization header', status: 401 }
    }

    const token = authHeader.slice(7)

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number }
    try {
      payload = await jwtService.verify(token) as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }

    // Verify user still exists and is active
    const user = await userStore.findById(payload.userId)
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 401 }
    }

    // Return user with roles array for RBAC
    return { user, roles: user.roles }
  }
}
