import type { SessionStore } from '../../auth/session-store'
import type { JwtService } from '../../auth/jwt-service'

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

export async function refresh(
  refreshToken: string,
  sessionStore: SessionStore,
  jwtService: JwtService
) {
  if (!refreshToken) {
    throw createError('Refresh token is required', 400)
  }

  let payload
  try {
    payload = await jwtService.verify(refreshToken)
  } catch {
    throw createError('Invalid or expired refresh token', 401)
  }

  const session = sessionStore.findByRefreshToken(refreshToken)
  if (!session) {
    throw createError('Session not found or expired', 401)
  }

  const tokenInput = { userId: payload.userId, email: payload.email, role: payload.role, sessionId: session.id }
  const newAccessToken = await jwtService.signAccessToken(tokenInput)
  const newRefreshToken = await jwtService.signRefreshToken(tokenInput)

  sessionStore.refresh(session.id, newAccessToken, newRefreshToken)
  jwtService.blacklist(refreshToken)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}
