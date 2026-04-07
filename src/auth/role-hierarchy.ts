/**
 * Role hierarchy with numeric levels
 * Higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1) > guest (0)
 */

export const ROLE_HIERARCHY_LEVELS: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if a user role has permission to access resources requiring a required role.
 * A user role that is higher in the hierarchy has permission to access resources
 * requiring a lower role.
 *
 * @param userRole - The role of the user (e.g., 'admin', 'editor', 'viewer', 'guest')
 * @param requiredRole - The role required to access the resource
 * @returns true if the user role is >= required role in the hierarchy, false otherwise
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY_LEVELS[userRole]
  const requiredLevel = ROLE_HIERARCHY_LEVELS[requiredRole]

  // If either role is not in the hierarchy, deny permission
  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}