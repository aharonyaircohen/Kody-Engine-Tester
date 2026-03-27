import type { SessionStore } from '../../auth/session-store'
import type { JwtService } from '../../auth/jwt-service'

export function logout(
  userId: string,
  sessionId: string,
  accessToken: string,
  allDevices: boolean,
  sessionStore: SessionStore,
  jwtService: JwtService
): void {
  if (allDevices) {
    sessionStore.revokeAllForUser(userId)
  } else {
    sessionStore.revoke(sessionId)
  }
  jwtService.blacklist(accessToken)
}
