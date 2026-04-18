/**
 * @deprecated This login function uses UserStore (in-memory SHA-256). Use AuthService
 * (Payload-based PBKDF2) for all new login flows. This function will be removed once
 * all callers are migrated to AuthService.login().
 */
import type { UserStore } from '../../auth/user-store'
import type { SessionStore } from '../../auth/session-store'
import type { JwtService } from '../../auth/jwt-service'

interface AuthError {
  message: string
  status: number
}

function createError(message: string, status: number): AuthError & Error {
  const err = new Error(message) as Error & AuthError
  err.status = status
  return err
}

export interface LoginResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
}

export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService
): Promise<LoginResult> {
  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }

  const user = await userStore.findByEmail(email)
  if (!user) {
    throw createError('Invalid credentials', 401)
  }

  if (!user.isActive) {
    throw createError('Account is inactive', 403)
  }

  if (userStore.isLocked(user)) {
    throw createError('Account is locked. Please try again later.', 423)
  }

  const valid = await userStore.verifyPassword(password, user.passwordHash, user.salt)
  if (!valid) {
    await userStore.recordFailedLogin(user.id)
    throw createError('Invalid credentials', 401)
  }

  await userStore.resetFailedAttempts(user.id)
  await userStore.update(user.id, { lastLoginAt: new Date() })

  const tokenPayload = { userId: user.id, email: user.email, role: user.role as 'admin' | 'editor' | 'viewer', sessionId: '', generation: 0 }
  const accessToken = await jwtService.signAccessToken(tokenPayload)
  const refreshToken = await jwtService.signRefreshToken(tokenPayload)

  const session = sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

  // Update token payload with actual sessionId
  const finalAccessToken = await jwtService.signAccessToken({ ...tokenPayload, sessionId: session.id })
  const finalRefreshToken = await jwtService.signRefreshToken({ ...tokenPayload, sessionId: session.id })
  sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

  return {
    accessToken: finalAccessToken,
    refreshToken: finalRefreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  }
}
