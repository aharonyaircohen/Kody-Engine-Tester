import type { UserStore } from '../../auth/user-store'
import type { SessionStore } from '../../auth/session-store'
import type { JwtService } from '../../auth/jwt-service'
import type { OAuth2Provider } from '../../auth/oauth2-pkce'

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

export interface OAuth2LoginResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
  isNewUser: boolean
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

export interface OAuth2ProviderConfig {
  provider: OAuth2Provider
  clientId: string
  clientSecret?: string
  authorizationUrl: string
  tokenUrl: string
  redirectUri: string
  scopes: string[]
}

const OAUTH2_CONFIGS: Record<OAuth2Provider, OAuth2ProviderConfig | null> = {
  google: process.env.GOOGLE_CLIENT_ID ? {
    provider: 'google',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    scopes: ['openid', 'email', 'profile'],
  } : null,
  github: process.env.GITHUB_CLIENT_ID ? {
    provider: 'github',
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
    scopes: ['user:email', 'read:user'],
  } : null,
  microsoft: process.env.MICROSOFT_CLIENT_ID ? {
    provider: 'microsoft',
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/microsoft`,
    scopes: ['openid', 'email', 'profile'],
  } : null,
  local: null,
}

/**
 * Get OAuth2 provider configuration
 */
export function getOAuth2Config(provider: OAuth2Provider): OAuth2ProviderConfig | null {
  return OAUTH2_CONFIGS[provider]
}

/**
 * Get list of enabled OAuth2 providers
 */
export function getEnabledOAuth2Providers(): OAuth2Provider[] {
  return (Object.keys(OAUTH2_CONFIGS) as OAuth2Provider[]).filter(p => OAUTH2_CONFIGS[p] !== null)
}
