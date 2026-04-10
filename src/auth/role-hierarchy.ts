export type RoleHierarchyRole = 'admin' | 'editor' | 'viewer' | 'guest'

/**
 * Role hierarchy: higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1) > guest (0)
 */
export const ROLE_HIERARCHY: Record<RoleHierarchyRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if a user role has permission to access a resource requiring the specified role.
 * A user with a higher role can access resources requiring lower roles.
 *
 * @param userRole - The role of the user
 * @param requiredRole - The minimum role required to access the resource
 * @returns true if the user has sufficient permissions, false otherwise
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as RoleHierarchyRole]
  const requiredLevel = ROLE_HIERARCHY[requiredRole as RoleHierarchyRole]

  // If either role is not in the hierarchy, deny access
  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}