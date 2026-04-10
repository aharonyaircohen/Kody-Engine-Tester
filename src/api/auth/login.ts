import type { AuthService } from '../../auth/auth-service'

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
  user: { id: string | number; email: string; role: string }
}

export async function login(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string,
  authService: AuthService
): Promise<LoginResult> {
  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }

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