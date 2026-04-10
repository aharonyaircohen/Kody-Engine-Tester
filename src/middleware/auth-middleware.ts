import type { AuthenticatedUser } from '../auth/auth-service'
import { JwtService } from '../auth/jwt-service'
import { AuthService } from '../auth/auth-service'
import { getPayloadInstance } from '@/services/progress'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

interface RequestContext {
  authorization?: string
  ip?: string
}

export function createAuthMiddleware(jwtService: JwtService) {
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
  const RATE_LIMIT_MAX = 100
  const RATE_LIMIT_WINDOW_MS = 60 * 1000

  return async function authMiddleware(req: RequestContext): Promise<AuthContext> {
    const ip = req.ip ?? 'unknown'
    const now = Date.now()

    // Rate limiting
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
      const payload = getPayloadInstance()
      const authService = new AuthService(payload as any, jwtService)
      const result = await authService.verifyAccessToken(token)
      if (result.user) {
        return { user: result.user }
      }
      return { error: 'User not found', status: 404 }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return { error: message, status: 401 }
    }
  }
}
