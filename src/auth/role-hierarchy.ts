/**
 * Role hierarchy: higher roles include permissions of lower roles
 * admin > editor > viewer > guest
 */
const ROLE_HIERARCHY: Record<string, number> = {
  admin: 4,
  editor: 3,
  viewer: 2,
  guest: 1,
}

/**
 * Check if a user role has permission to access a resource requiring the specified role.
 * A user with a higher role can access resources requiring lower roles.
 * Unknown roles are denied by default (0 level).
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const requiredLevel = ROLE_HIERARCHY[requiredRole]

  // If either role is unknown, deny access
  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}
