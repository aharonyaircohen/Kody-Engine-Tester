/**
 * Role hierarchy: higher levels include permissions of lower levels
 * admin (3) > editor (2) > viewer (1) > guest (0)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if a user role has permission to access a resource requiring the specified role.
 * A user with a higher role can access resources requiring a lower role.
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const requiredLevel = ROLE_HIERARCHY[requiredRole]

  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}