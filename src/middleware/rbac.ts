/**
 * RBAC middleware - single import point for role-based access control utilities
 */
export { requireRole } from './role-guard'
export { checkRole, extractBearerToken, ROLE_HIERARCHY } from '../auth/_auth'
export type { RbacRole } from '../auth/auth-service'
export type { AuthenticatedUser } from '../auth/auth-service'
