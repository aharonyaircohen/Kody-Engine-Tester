import type { UserStore } from '../../auth/user-store'
import type { JwtService } from '../../auth/jwt-service'
import type { RbacRole } from '../../auth/auth-service'

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
  user: { id: string; email: string; role: RbacRole }
}

export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  userStore: UserStore,
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

  // JWT tokens are self-contained - sessionId is generated fresh for each login
  const sessionId = `session-${user.id}-${Date.now()}`
  const tokenPayload = { userId: user.id, email: user.email, role: user.role, sessionId, generation: 0 }
  const accessToken = await jwtService.signAccessToken(tokenPayload)
  const refreshToken = await jwtService.signRefreshToken(tokenPayload)

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  }
}
