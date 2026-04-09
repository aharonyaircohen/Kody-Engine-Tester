const ROLE_HIERARCHY: Record<string, number> = {
  guest: 0,
  viewer: 1,
  editor: 2,
  admin: 3,
}

/**
 * Checks if a user role has permission to access a resource requiring the specified role.
 * Hierarchy: admin > editor > viewer > guest
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const requiredLevel = ROLE_HIERARCHY[requiredRole]

  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}
