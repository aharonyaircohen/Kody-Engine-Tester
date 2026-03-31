import crypto from 'crypto'

export type OAuth2Provider = 'google' | 'github'

export interface OAuth2Config {
  clientId: string
  clientSecret: string
  callbackUrl: string
  scopes: string[]
}

export interface OAuth2TokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

export interface OAuth2UserInfo {
  provider: OAuth2Provider
  providerId: string
  email: string
  name?: string
  picture?: string
}

export interface OAuth2State {
  provider: OAuth2Provider
  redirectUrl?: string
  codeVerifier?: string
  createdAt: number
}

const STATE_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes
const stateStore = new Map<string, OAuth2State>() // Shared state store for all providers

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length)
}

function generateCodeVerifier(): string {
  return generateRandomString(64)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Buffer.from(new Uint8Array(hashBuffer)).toString('base64url')
}

function createState(provider: OAuth2Provider, redirectUrl?: string): { state: string; codeVerifier: string } {
  const codeVerifier = generateCodeVerifier()
  const stateObj: OAuth2State = {
    provider,
    redirectUrl,
    codeVerifier,
    createdAt: Date.now(),
  }
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url')
  stateStore.set(state, stateObj)

  // Cleanup old states
  cleanupStates()

  return { state, codeVerifier }
}

function validateState(state: string): OAuth2State | null {
  const stateObj = stateStore.get(state)
  if (!stateObj) return null

  if (Date.now() - stateObj.createdAt > STATE_EXPIRY_MS) {
    stateStore.delete(state)
    return null
  }

  stateStore.delete(state)
  return stateObj
}

function cleanupStates(): void {
  const now = Date.now()
  for (const [state, obj] of stateStore.entries()) {
    if (now - obj.createdAt > STATE_EXPIRY_MS) {
      stateStore.delete(state)
    }
  }
}

abstract class OAuth2ProviderBase {
  protected config: OAuth2Config

  constructor(config: OAuth2Config) {
    this.config = config
  }

  abstract getAuthorizationUrl(state: string, codeChallenge: string): Promise<string>
  abstract exchangeCode(code: string, codeVerifier: string): Promise<OAuth2TokenResponse>
  abstract getUserInfo(accessToken: string): Promise<OAuth2UserInfo>
}

export class GoogleOAuth2Provider extends OAuth2ProviderBase {
  private static readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token'
  private static readonly USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

  constructor(config: OAuth2Config) {
    super(config)
  }

  async getAuthorizationUrl(state: string, codeChallenge: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent',
    })
    return `${GoogleOAuth2Provider.AUTH_URL}?${params.toString()}`
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<OAuth2TokenResponse> {
    const response = await fetch(GoogleOAuth2Provider.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.callbackUrl,
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuth2UserInfo> {
    const response = await fetch(GoogleOAuth2Provider.USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`Google user info fetch failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      provider: 'google',
      providerId: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
    }
  }
}

export class GitHubOAuth2Provider extends OAuth2ProviderBase {
  private static readonly AUTH_URL = 'https://github.com/login/oauth/authorize'
  private static readonly TOKEN_URL = 'https://github.com/login/oauth/access_token'
  private static readonly USER_INFO_URL = 'https://api.github.com/user'
  private static readonly EMAILS_URL = 'https://api.github.com/user/emails'

  constructor(config: OAuth2Config) {
    super(config)
  }

  async getAuthorizationUrl(state: string, codeChallenge: string): Promise<string> {
    // GitHub doesn't support PKCE natively in the same way, so we store codeVerifier in state
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scopes.join(' '),
      state,
    })
    return `${GitHubOAuth2Provider.AUTH_URL}?${params.toString()}`
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<OAuth2TokenResponse> {
    const response = await fetch(GitHubOAuth2Provider.TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.callbackUrl,
        code,
        state: codeVerifier, // Store verifier in state for validation if needed
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub token exchange failed: ${response.status}`)
    }

    const data = await response.json()
    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description}`)
    }

    return {
      accessToken: data.access_token,
      refreshToken: undefined, // GitHub doesn't provide refresh tokens
      expiresIn: -1, // GitHub tokens don't expire
      tokenType: data.token_type,
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuth2UserInfo> {
    const userResponse = await fetch(GitHubOAuth2Provider.USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      throw new Error(`GitHub user info fetch failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Try to get email if not public
    let email = userData.email
    if (!email) {
      const emailsResponse = await fetch(GitHubOAuth2Provider.EMAILS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      if (emailsResponse.ok) {
        const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsResponse.json()
        const primaryEmail = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified)
        email = primaryEmail?.email
      }
    }

    if (!email) {
      throw new Error('GitHub account has no verified email')
    }

    return {
      provider: 'github',
      providerId: String(userData.id),
      email,
      name: userData.name || userData.login,
      picture: userData.avatar_url,
    }
  }
}

export interface OAuth2ProviderRegistry {
  google: GoogleOAuth2Provider
  github: GitHubOAuth2Provider
}

export function createOAuth2Providers(configs: Record<OAuth2Provider, OAuth2Config>): OAuth2ProviderRegistry {
  return {
    google: new GoogleOAuth2Provider(configs.google),
    github: new GitHubOAuth2Provider(configs.github),
  }
}

export async function createAuthorizationUrl(
  provider: OAuth2Provider,
  providers: OAuth2ProviderRegistry,
  redirectUrl?: string
): Promise<{ url: string; state: string; codeVerifier: string }> {
  const oauth2Provider = providers[provider]
  const { state, codeVerifier } = createState(provider, redirectUrl)

  let codeChallenge: string
  if (provider === 'google') {
    codeChallenge = await generateCodeChallenge(codeVerifier)
  } else {
    // GitHub stores verifier in state
    codeChallenge = codeVerifier
  }

  const url = await oauth2Provider.getAuthorizationUrl(state, codeChallenge)
  return { url, state, codeVerifier }
}

export async function handleOAuth2Callback(
  provider: OAuth2Provider,
  providers: OAuth2ProviderRegistry,
  code: string,
  state: string,
  codeVerifier: string
): Promise<OAuth2UserInfo> {
  const oauth2Provider = providers[provider]
  const stateObj = validateState(state)

  if (!stateObj) {
    throw new Error('Invalid or expired OAuth2 state')
  }

  if (stateObj.provider !== provider) {
    throw new Error('OAuth2 provider mismatch')
  }

  const tokenResponse = await oauth2Provider.exchangeCode(code, codeVerifier)
  const userInfo = await oauth2Provider.getUserInfo(tokenResponse.accessToken)

  return userInfo
}

export { generateCodeVerifier, generateCodeChallenge, createState, validateState }
