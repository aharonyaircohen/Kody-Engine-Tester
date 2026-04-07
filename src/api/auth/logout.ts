import type { AuthService } from '../../auth/auth-service'
import type { JwtService } from '../../auth/jwt-service'

export async function logout(
  userId: string,
  accessToken: string,
  allDevices: boolean,
  authService: AuthService,
  jwtService: JwtService
): Promise<void> {
  // Blacklist the current access token immediately
  jwtService.blacklist(accessToken)

  if (allDevices) {
    // If allDevices=true, clear ALL refresh tokens for the user by calling logout
    // This invalidates all sessions across all devices
    await authService.logout(userId)
  } else {
    // Single device logout: clear only the stored refresh token in DB
    // The access token is already blacklisted above
    await authService.logout(userId)
  }
}
