import type { RbacRole } from './auth-service'
import { checkRole, extractBearerToken, ROLE_HIERARCHY, hasPermission, type AuthContext, type Permission } from './rbac'

export type { Permission }

export { checkRole, extractBearerToken, ROLE_HIERARCHY, hasPermission }

export type { AuthContext }

export interface AuthOptions {
  roles?: RbacRole[]
}
