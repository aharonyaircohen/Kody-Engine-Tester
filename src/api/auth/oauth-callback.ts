import type { UserStore } from '../../auth/user-store'
import type { SessionStore } from '../../auth/session-store'
import type { JwtService } from '../../auth/jwt-service'
import type { AuthController } from '../../auth/authController'
import type { OAuth2Provider, OAuth2UserInfo } from '../../auth/oauth2'

export interface OAuthCallbackResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: string }
  isNewUser: boolean
}

interface OAuthError {
  message: string
  status: number
}

function createError(message: string, status: number): OAuthError & Error {
  const err = new Error(message) as Error & OAuthError
  err.status = status
  return err
}

export async function handleOAuthCallback(
  provider: OAuth2Provider,
  code: string,
  state: string,
  codeVerifier: string,
  ipAddress: string,
  userAgent: string,
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService,
  authController: AuthController
): Promise<OAuthCallbackResult> {
  if (!code || !state) {
    throw createError('Authorization code and state are required', 400)
  }

  // Import OAuth2 handlers dynamically to avoid circular dependencies
  const { handleOAuth2Callback } = await import('../../auth/oauth2')

  let userInfo: OAuth2UserInfo
  try {
    // We need the providers registry - create it inline for the callback
    const { createOAuth2Providers } = await import('../../auth/oauth2')
    const config = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
        scopes: ['openid', 'email', 'profile'],
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        callbackUrl: process.env.GITHUB_CALLBACK_URL || '',
        scopes: ['user:email'],
      },
    }
    const providers = createOAuth2Providers(config)
    userInfo = await handleOAuth2Callback(provider, providers, code, state, codeVerifier)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth callback failed'
    throw createError(message, 400)
  }

  // Check if user exists by provider
  const existingUser = await userStore.findByProvider(provider, userInfo.providerId)

  if (existingUser) {
    // Existing user logging in with OAuth
    await userStore.update(existingUser.id, { lastLoginAt: new Date() })

    const tokenPayload = {
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      sessionId: '',
      generation: 0,
    }
    const accessToken = await jwtService.signAccessToken(tokenPayload)
    const refreshToken = await jwtService.signRefreshToken(tokenPayload)
    const session = sessionStore.create(existingUser.id, accessToken, refreshToken, ipAddress, userAgent)

    const finalAccessToken = await jwtService.signAccessToken({ ...tokenPayload, sessionId: session.id })
    const finalRefreshToken = await jwtService.signRefreshToken({ ...tokenPayload, sessionId: session.id })
    sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

    return {
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: { id: existingUser.id, email: existingUser.email, role: existingUser.role },
      isNewUser: false,
    }
  } else {
    // New user registering via OAuth
    const user = await userStore.createOAuth({
      email: userInfo.email,
      provider: provider,
      providerId: userInfo.providerId,
      role: 'viewer',
    })

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: '',
      generation: 0,
    }
    const accessToken = await jwtService.signAccessToken(tokenPayload)
    const refreshToken = await jwtService.signRefreshToken(tokenPayload)
    const session = sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

    const finalAccessToken = await jwtService.signAccessToken({ ...tokenPayload, sessionId: session.id })
    const finalRefreshToken = await jwtService.signRefreshToken({ ...tokenPayload, sessionId: session.id })
    sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

    return {
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
      isNewUser: true,
    }
  }
}

export async function linkOAuthProvider(
  userId: string,
  provider: OAuth2Provider,
  code: string,
  state: string,
  codeVerifier: string,
  ipAddress: string,
  userAgent: string,
  userStore: UserStore,
  sessionStore: SessionStore,
  jwtService: JwtService
): Promise<OAuthCallbackResult> {
  if (!code || !state) {
    throw createError('Authorization code and state are required', 400)
  }

  const { handleOAuth2Callback, createOAuth2Providers } = await import('../../auth/oauth2')

  const config = {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
      scopes: ['openid', 'email', 'profile'],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || '',
      scopes: ['user:email'],
    },
  }
  const providers = createOAuth2Providers(config)

  let userInfo: OAuth2UserInfo
  try {
    userInfo = await handleOAuth2Callback(provider, providers, code, state, codeVerifier)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth callback failed'
    throw createError(message, 400)
  }

  // Check if provider is already linked to another user
  const existingProviderUser = await userStore.findByProvider(provider, userInfo.providerId)
  if (existingProviderUser && existingProviderUser.id !== userId) {
    throw createError('Provider account already linked to another user', 409)
  }

  // Link the provider to the current user
  await userStore.linkAccount(userId, provider, userInfo.providerId)

  const user = await userStore.findById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  // Create new session after linking
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: '',
    generation: 0,
  }
  const accessToken = await jwtService.signAccessToken(tokenPayload)
  const refreshToken = await jwtService.signRefreshToken(tokenPayload)
  const session = sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

  const finalAccessToken = await jwtService.signAccessToken({ ...tokenPayload, sessionId: session.id })
  const finalRefreshToken = await jwtService.signRefreshToken({ ...tokenPayload, sessionId: session.id })
  sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

  return {
    accessToken: finalAccessToken,
    refreshToken: finalRefreshToken,
    user: { id: user.id, email: user.email, role: user.role },
    isNewUser: false,
  }
}