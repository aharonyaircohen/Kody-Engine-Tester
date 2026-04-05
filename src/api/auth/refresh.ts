import type { AuthService } from '../../auth/auth-service'

export async function refresh(
  refreshToken: string,
  authService: AuthService
): Promise<{ accessToken: string; refreshToken: string }> {
  return authService.refresh(refreshToken)
}
