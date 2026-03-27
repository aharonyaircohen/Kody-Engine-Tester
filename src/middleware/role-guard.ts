import type { User } from '../auth/user-store'

interface RoleContext {
  user?: User
}

interface RoleError {
  error: string
  status: number
}

export function requireRole(...roles: string[]) {
  return function roleGuard(context: RoleContext): RoleError | undefined {
    if (!context.user) {
      return { error: 'Authentication required', status: 401 }
    }

    if (!roles.includes(context.user.role)) {
      return {
        error: `Forbidden: requires role ${roles.join(' or ')}`,
        status: 403,
      }
    }

    return undefined
  }
}
