import type { AuthService } from '../../auth/auth-service'

export async function logout(
  userId: string,
  _accessToken: string,
  _allDevices: boolean,
  authService: AuthService
): Promise<void> {
  // AuthService uses JWT token rotation - clearing refresh token invalidates all tokens
  await authService.logout(userId)
}
