/**
 * Role hierarchy for permission checking
 * Higher numbers include permissions of lower numbers
 * admin (3) > editor (2) > viewer (1) > guest (0)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if a user role has equal or higher privilege than a required role.
 * @param userRole - The role of the user
 * @param requiredRole - The minimum role required
 * @returns true if userRole has sufficient privilege, false otherwise
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const requiredLevel = ROLE_HIERARCHY[requiredRole]

  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}
