import type { RbacRole } from './auth-service'

export type { RbacRole } from './auth-service'

/**
 * Role hierarchy: higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1)
 */
export const ROLE_HIERARCHY: Record<RbacRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export type Permission = 'read' | 'write' | 'delete' | 'admin'

export const ROLE_PERMISSIONS: Record<RbacRole, Permission[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  editor: ['read', 'write'],
  viewer: ['read'],
}

export function hasPermission(role: RbacRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
