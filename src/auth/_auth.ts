import type { RbacRole } from './auth-service'

// Re-export from rbac.ts for backward compatibility
export { checkRole, ROLE_HIERARCHY, canAccessRole, hasPermission } from './rbac'
export type { AuthContext, AuthOptions } from './rbac'

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}
