import { UserStore } from '../auth/user-store'
import { SessionStore } from '../auth/session-store'
import { JwtService } from '../auth/jwt-service'
import type { User } from '../auth/user-store'
import type { Session } from '../auth/session-store'
import type { RbacRole } from '../auth/auth-service'

export interface AuthContext {
  user?: User
  session?: Session
  error?: string
  status?: number
  tenantId?: string
  tenantRole?: RbacRole
}

interface RequestContext {
  authorization?: string
  ip?: string
  tenantId?: string
}

const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW_MS = 60 * 1000

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface TokenPayload {
  userId: string
  email: string
  role: string
  sessionId: string
  generation: number
  tenantId?: string
}

interface UserWithTenant extends User {
  organization?: string
  tenantPermissions?: Array<{
    tenantId: string
    role: string
    grantedAt: string
    grantedBy?: string
  }>
}

export function createAuthMiddleware(
  userStore: UserStore,
  sessionStore: SessionStore,
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

    let payload: TokenPayload
    try {
      payload = await jwtService.verify(token) as unknown as TokenPayload
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }

    const session = sessionStore.findByToken(token)
    if (!session) {
      return { error: 'Session not found or expired', status: 401 }
    }

    if (payload.generation < session.generation) {
      return { error: 'Token has been superseded by a newer session', status: 401 }
    }

    const user = await userStore.findById(payload.userId) as UserWithTenant | undefined
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 401 }
    }

    // Determine tenant context
    const tenantId = req.tenantId
    let tenantRole: RbacRole | undefined

    if (tenantId) {
      // Check if user has access to this tenant
      if (user.organization === tenantId) {
        tenantRole = user.role as RbacRole
      } else if (user.tenantPermissions) {
        const permission = user.tenantPermissions.find(tp => tp.tenantId === tenantId)
        if (permission) {
          tenantRole = permission.role as RbacRole
        }
      }

      if (!tenantRole) {
        return { error: 'Access denied to this tenant', status: 403 }
      }
    }

    return { user, session, tenantId, tenantRole }
  }
}
