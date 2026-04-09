import type { AuthService } from '../../auth/auth-service'
import type { AuthResult } from '../../auth/auth-service'

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: { id: string | number; email: string; role: string }
}

export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  authService: AuthService
): Promise<LoginResult> {
  const result = await authService.login(email, password, ipAddress, userAgent)
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
  }
}
