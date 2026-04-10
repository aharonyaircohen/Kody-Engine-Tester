import { getAuthService } from '../../auth/withAuth'

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
}

export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string
): Promise<LoginResult> {
  const authService = getAuthService()
  const result = await authService.login(email, password, ipAddress, userAgent)

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: String(result.user.id),
      email: result.user.email,
      role: result.user.role,
    },
  }
}
