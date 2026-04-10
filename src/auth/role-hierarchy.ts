/**
 * Role hierarchy for permission checking
 * Higher numeric value = more permissions
 * admin > editor > viewer > guest
 */
export type Role = 'admin' | 'editor' | 'viewer' | 'guest'

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  guest: 0,
}

/**
 * Check if a user role has permission to access a resource requiring the specified role.
 * A user with a higher role can access lower-role resources.
 *
 * @param userRole - The user's role
 * @param requiredRole - The minimum role required to access the resource
 * @returns true if the user has sufficient permissions, false otherwise
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role]
  const requiredLevel = ROLE_HIERARCHY[requiredRole as Role]

  // If either role is invalid, deny access
  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}