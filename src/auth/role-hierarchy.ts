/**
 * Role hierarchy levels: higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1) > guest (0)
 */
const ROLE_LEVELS: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if a user role has permission to access a resource requiring the specified role.
 * Higher roles inherit permissions of lower roles (hierarchical inheritance).
 *
 * @param userRole - The role of the user
 * @param requiredRole - The minimum role required to access the resource
 * @returns true if user has permission, false otherwise
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_LEVELS[userRole]
  // If required role is unknown, treat it as no specific requirement (pass)
  if (!(requiredRole in ROLE_LEVELS)) {
    return true
  }
  // If user role is unknown, they have no permissions
  if (userLevel === undefined) {
    return false
  }
  const requiredLevel = ROLE_LEVELS[requiredRole]
  return userLevel >= requiredLevel
}