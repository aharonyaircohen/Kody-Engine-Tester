import { UserStore } from '../auth/user-store'
import { JwtService } from '../auth/jwt-service'
import type { User } from '../auth/user-store'
import type { RbacRole } from '../auth/auth-service'

export interface AuthContext {
  user?: User
  error?: string
  status?: number
}

interface RequestContext {
  authorization?: string
  ip?: string
}

const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

interface RateLimitEntry {
  count: number
  resetAt: number
}

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

    // JWT tokens are self-contained - no need for session lookup
    // The generation counter in the token itself handles token refresh/rotation

    const user = await userStore.findById(payload.userId)
    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 401 }
    }

    return { user }
  }
}
