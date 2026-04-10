import { UserStore } from '../auth/user-store'
import { SessionStore } from '../auth/session-store'
import { JwtService } from '../auth/jwt-service'
import type { User } from '../auth/user-store'
import type { Session } from '../auth/session-store'

export interface AuthContext {
  user?: User
  session?: Session
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

    let payload
    try {
      payload = await jwtService.verify(token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 403 }
    }

    const session = sessionStore.findByToken(token)
    if (!session) {
      return { error: 'Session not found or expired', status: 403 }
    }

    if (payload.generation < session.generation) {
      return { error: 'Token has been superseded by a newer session', status: 403 }
    }

    const user = await userStore.findById(payload.userId)
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 403 }
    }

    return { user, session }
  }
}
