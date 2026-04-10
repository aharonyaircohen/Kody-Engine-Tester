import type { AuthService } from '../auth/auth-service'
import type { AuthenticatedUser } from '../auth/auth-service'
import type { Session } from '../auth/session-store'

export interface AuthContext {
  user?: AuthenticatedUser
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
  authService: AuthService
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

    try {
      const result = await authService.verifyAccessToken(token)
      if (result.user) {
        return { user: result.user }
      } else {
        return { error: 'User not found', status: 404 }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }
  }
}
