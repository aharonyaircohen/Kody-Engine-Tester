import type { UserStore } from '../../auth/user-store'
import type { JwtAuthStore } from '../../auth/jwt-auth-store'
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
  userStore: UserStore,
  jwtAuthStore: JwtAuthStore,
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

  // Create tokens with empty sessionId first to get the token ID
  const tempAccessToken = await jwtService.signAccessToken(tokenPayload)
  const tempRefreshToken = await jwtService.signRefreshToken(tokenPayload)
  const storedToken = jwtAuthStore.create(user.id, tempAccessToken, tempRefreshToken)

  // Re-sign tokens with the actual sessionId (the stored token's key)
  const finalAccessToken = await jwtService.signAccessToken({ ...tokenPayload, sessionId: storedToken.token, generation: 0 })
  const finalRefreshToken = await jwtService.signRefreshToken({ ...tokenPayload, sessionId: storedToken.token, generation: 0 })

  // Update stored token with final tokens using public API (doesn't increment generation)
  jwtAuthStore.updateTokens(storedToken.token, finalAccessToken, finalRefreshToken)

  return {
    accessToken: finalAccessToken,
    refreshToken: finalRefreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  }
}