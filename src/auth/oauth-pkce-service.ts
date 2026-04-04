import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'
import { JwtService } from './jwt-service'
import type { TenantRole } from './jwt-service'
import crypto from 'crypto'

export type OAuthProvider = 'google' | 'github'

interface OAuthConfig {
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  redirectUri: string
  scopes: string[]
}

interface PKCEPair {
  verifier: string
  challenge: string
}

interface OAuthState {
  provider: OAuthProvider
  redirectUri: string
  tenantId: string
  codeVerifier: string
  createdAt: number
}

interface OAuthTokenResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: number | string
    email: string
    role: string
    tenantId: string
    roles: TenantRole[]
  }
}

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

// In-memory state store (use Redis in production)
const oauthStateStore = new Map<string, OAuthState>()

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return hash.toString('base64url')
}

function generateState(): string {
  return crypto.randomBytes(16).toString('base64url')
}

const GOOGLE_CONFIG: OAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  redirectUri: process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/api/auth/callback/google',
  scopes: ['openid', 'email', 'profile'],
}

const GITHUB_CONFIG: OAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID ?? '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  redirectUri: process.env.GITHUB_REDIRECT_URI ?? 'http://localhost:3000/api/auth/callback/github',
  scopes: ['user:email', 'read:user'],
}

function getProviderConfig(provider: OAuthProvider): OAuthConfig {
  return provider === 'google' ? GOOGLE_CONFIG : GITHUB_CONFIG
}

export class OAuthPKCEService {
  constructor(
    private payload: Payload,
    private jwtService: JwtService,
  ) {}

  /**
   * Initiates OAuth2 PKCE flow by generating authorization URL
   */
  async getAuthorizationUrl(
    provider: OAuthProvider,
    tenantId: string = 'default',
    redirectUri?: string
  ): Promise<{ url: string; state: string }> {
    const config = getProviderConfig(provider)
    const actualRedirectUri = redirectUri ?? config.redirectUri

    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateState()

    // Store OAuth state
    oauthStateStore.set(state, {
      provider,
      redirectUri: actualRedirectUri,
      tenantId,
      codeVerifier,
      createdAt: Date.now(),
    })

    // Clean up expired states
    this.cleanupExpiredStates()

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: actualRedirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return {
      url: `${config.authorizationUrl}?${params.toString()}`,
      state,
    }
  }

  /**
   * Handles OAuth callback and exchanges authorization code for tokens
   */
  async handleCallback(
    code: string,
    state: string
  ): Promise<OAuthTokenResult> {
    const oauthState = oauthStateStore.get(state)

    if (!oauthState) {
      throw new Error('Invalid or expired state parameter')
    }

    if (Date.now() - oauthState.createdAt > OAUTH_STATE_TTL_MS) {
      oauthStateStore.delete(state)
      throw new Error('OAuth state expired')
    }

    oauthStateStore.delete(state)

    const config = getProviderConfig(oauthState.provider)

    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(
      code,
      oauthState.codeVerifier,
      config
    )

    // Get user info from provider
    const userInfo = await this.getUserInfo(oauthState.provider, tokenResponse.accessToken)

    // Find or create user
    const user = await this.findOrCreateOAuthUser(
      oauthState.provider,
      userInfo,
      oauthState.tenantId
    )

    // Generate JWT tokens
    const tokenPayload = {
      userId: String(user.id),
      email: user.email,
      role: user.role as 'admin' | 'editor' | 'viewer',
      tenantId: user.tenantId,
      roles: user.roles,
      sessionId: `oauth-${user.id}-${Date.now()}`,
      generation: 0,
    }

    const accessToken = await this.jwtService.signAccessToken(tokenPayload)
    const refreshToken = await this.jwtService.signRefreshToken(tokenPayload)

    return {
      accessToken,
      refreshToken,
      expiresIn: tokenResponse.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        roles: user.roles,
      },
    }
  }

  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
    config: OAuthConfig
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    })

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    const data = await response.json() as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  }

  private async getUserInfo(
    provider: OAuthProvider,
    accessToken: string
  ): Promise<{ id: string; email: string; name?: string }> {
    if (provider === 'google') {
      return this.getGoogleUserInfo(accessToken)
    } else {
      return this.getGitHubUserInfo(accessToken)
    }
  }

  private async getGoogleUserInfo(accessToken: string): Promise<{ id: string; email: string; name?: string }> {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get Google user info: ${response.statusText}`)
    }

    const data = await response.json() as Record<string, unknown>
    return {
      id: String(data.sub),
      email: String(data.email),
      name: data.name as string | undefined,
    }
  }

  private async getGitHubUserInfo(accessToken: string): Promise<{ id: string; email: string; name?: string }> {
    // Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!userResponse.ok) {
      throw new Error(`Failed to get GitHub user info: ${userResponse.statusText}`)
    }

    const userData = await userResponse.json() as Record<string, unknown>

    // GitHub may not return email in /user endpoint if it's not public
    // Try to get email from /user/emails endpoint
    let email = userData.email as string | undefined

    if (!email) {
      email = await this.getGitHubPrimaryEmail(accessToken)
    }

    if (!email) {
      throw new Error('GitHub account does not have a verified email address')
    }

    return {
      id: String(userData.id),
      email,
      name: userData.name as string | undefined,
    }
  }

  private async getGitHubPrimaryEmail(accessToken: string): Promise<string | undefined> {
    try {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })

      if (!emailsResponse.ok) {
        return undefined
      }

      const emails = await emailsResponse.json() as Array<{
        email: string
        primary: boolean
        verified: boolean
      }>

      // Find primary and verified email
      const primaryEmail = emails.find(e => e.primary && e.verified)
      return primaryEmail?.email ?? emails.find(e => e.verified)?.email
    } catch {
      return undefined
    }
  }

  private async findOrCreateOAuthUser(
    provider: OAuthProvider,
    userInfo: { id: string; email: string; name?: string },
    tenantId: string
  ): Promise<{
    id: number | string
    email: string
    role: string
    tenantId: string
    roles: TenantRole[]
  }> {
    // Check if user exists with this OAuth provider
    const existingUsers = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: {
        and: [
          { email: { equals: userInfo.email } },
        ],
      },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      const user = existingUsers.docs[0] as unknown as Record<string, unknown>

      // Update OAuth providers array
      const existingProviders = (user.oauthProviders as Array<{
        provider: string
        providerId: string
        email: string
        connectedAt: string
      }> | undefined) ?? []

      const providerEntry = existingProviders.find(p => p.provider === provider)
      if (!providerEntry) {
        existingProviders.push({
          provider,
          providerId: userInfo.id,
          email: userInfo.email,
          connectedAt: new Date().toISOString(),
        })

        await this.payload.update({
          collection: 'users' as CollectionSlug,
          id: user.id as string | number,
          data: {
            oauthProviders: existingProviders,
          } as any,
        })
      }

      return {
        id: user.id as string | number,
        email: user.email as string,
        role: user.role as string,
        tenantId: (user.tenantId as string) ?? tenantId,
        roles: (user.roles as TenantRole[]) ?? [],
      }
    }

    // Create new user
    const newUser = await this.payload.create({
      collection: 'users' as CollectionSlug,
      data: {
        email: userInfo.email,
        firstName: userInfo.name?.split(' ')[0] ?? '',
        lastName: userInfo.name?.split(' ').slice(1).join(' ') ?? '',
        role: 'viewer',
        tenantId,
        roles: [{ tenantId, role: 'viewer' }],
        oauthProviders: [{
          provider,
          providerId: userInfo.id,
          email: userInfo.email,
          connectedAt: new Date().toISOString(),
        }],
        isActive: true,
      } as any,
    })

    return {
      id: (newUser as unknown as Record<string, unknown>).id as number | string,
      email: userInfo.email,
      role: 'viewer',
      tenantId,
      roles: [{ tenantId, role: 'viewer' }],
    }
  }

  /**
   * Removes an OAuth provider connection from a user
   */
  async disconnectProvider(
    userId: number | string,
    provider: OAuthProvider
  ): Promise<void> {
    const userResults = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: userId } },
      limit: 1,
    })

    const user = userResults.docs[0] as unknown as Record<string, unknown>
    if (!user) {
      throw new Error('User not found')
    }

    const providers = (user.oauthProviders as Array<{
      provider: string
      providerId: string
      email: string
      connectedAt: string
    }> | undefined) ?? []

    const updatedProviders = providers.filter(p => p.provider !== provider)

    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: userId,
      data: {
        oauthProviders: updatedProviders,
      } as any,
    })
  }

  private cleanupExpiredStates(): void {
    const now = Date.now()
    for (const [key, state] of oauthStateStore.entries()) {
      if (now - state.createdAt > OAUTH_STATE_TTL_MS) {
        oauthStateStore.delete(key)
      }
    }
  }
}