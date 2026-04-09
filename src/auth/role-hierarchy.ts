/**
 * Role hierarchy with numeric levels
 * Higher roles inherit permissions of lower roles
 * admin (3) > editor (2) > viewer (1) > guest (0)
 */

export const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if userRole has permission to perform actions requiring requiredRole.
 * Higher roles inherit all permissions of lower roles.
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? -1

  if (userLevel === -1 || requiredLevel === -1) {
    return false
  }

  return userLevel >= requiredLevel
}
