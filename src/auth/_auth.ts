import type { AuthenticatedUser, RbacRole } from './auth-service'
import { JwtService } from './jwt-service'
import { JwtServiceV2 } from './jwt-v2'
import type { TokenPayload } from './jwt-v2'

export type AuthMode = 'legacy' | 'v2' | 'dual'

/**
 * Migration mode configuration:
 * - 'legacy': Use only HS256 (v1) tokens
 * - 'v2': Use only RS256 (v2) tokens
 * - 'dual': Support both HS256 and RS256 tokens during migration
 */
export const AUTH_MODE: AuthMode = (process.env.AUTH_MODE as AuthMode) || 'legacy'

/**
 * Check if we're in migration mode (dual auth)
 */
export const MIGRATION_MODE = AUTH_MODE === 'dual'

export interface AuthContext {
  user?: AuthenticatedUser
  error?: string
  status?: number
}

export interface AuthOptions {
  roles?: RbacRole[]
}

/**
 * Role hierarchy: higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1)
 */
export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

// Singleton instances for v1 and v2 JWT services
let jwtServiceV1: JwtService | null = null
let jwtServiceV2: JwtServiceV2 | null = null

function getJwtServiceV1(): JwtService {
  if (!jwtServiceV1) {
    jwtServiceV1 = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceV1
}

function getJwtServiceV2Instance(): JwtServiceV2 {
  if (!jwtServiceV2) {
    jwtServiceV2 = new JwtServiceV2({
      privateKey: process.env.JWT_V2_PRIVATE_KEY,
      publicKey: process.env.JWT_V2_PUBLIC_KEY,
      migrationMode: MIGRATION_MODE,
    })
  }
  return jwtServiceV2
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * Check if a token is an RS256 (v2) token by inspecting the JWT header
 */
export function isRs256Token(token: string | null): boolean {
  if (!token) return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'))
    return header.alg === 'RS256'
  } catch {
    return false
  }
}

/**
 * Verify a token using the appropriate service based on AUTH_MODE
 * In 'dual' mode, automatically detects RS256 vs HS256 tokens
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  if (AUTH_MODE === 'v2' || (AUTH_MODE === 'dual' && isRs256Token(token))) {
    return getJwtServiceV2Instance().verify(token)
  }
  return getJwtServiceV1().verify(token) as Promise<TokenPayload>
}

/**
 * Dual verify - tries v1 (HS256) first, then v2 (RS256) if v1 fails
 * This is used during migration to support both token types
 */
export async function dualVerify(token: string): Promise<{ payload: TokenPayload; version: 'v1' | 'v2' }> {
  // Try v1 first (HS256)
  if (AUTH_MODE !== 'v2') {
    try {
      const payload = await getJwtServiceV1().verify(token)
      return { payload: payload as TokenPayload, version: 'v1' }
    } catch {
      // Token might be v2, continue to v2 verification
    }
  }

  // Try v2 (RS256)
  if (AUTH_MODE !== 'legacy') {
    try {
      const payload = await getJwtServiceV2Instance().verify(token)
      return { payload, version: 'v2' }
    } catch (err) {
      throw new Error(`Token verification failed for both v1 and v2: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  throw new Error('No valid authentication mode available')
}

/**
 * Check if user has one of the required roles (with hierarchical inheritance)
 * A user with a higher role can access lower-role resources
 */
export function checkRole(user: AuthenticatedUser | undefined, roles: RbacRole[] | undefined): AuthContext {
  if (!user) {
    return { error: 'Authentication required', status: 401 }
  }

  if (!roles || roles.length === 0) {
    return { user }
  }

  if (!user.role) {
    return { error: 'User role not configured', status: 401 }
  }

  const userRoleLevel = ROLE_HIERARCHY[user.role]
  const hasSufficientRole = roles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])

  if (!hasSufficientRole) {
    return {
      error: `Forbidden: requires role ${roles.join(' or ')}`,
      status: 403,
    }
  }

  return { user }
}
