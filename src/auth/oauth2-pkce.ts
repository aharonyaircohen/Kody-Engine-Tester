import crypto from 'crypto'

/**
 * OAuth2 PKCE (Proof Key for Code Exchange) utilities
 * Implements RFC 7636 for enhanced security in authorization code flows
 */

const CODE_VERIFIER_LENGTH = 64
const CODE_VERIFIER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

export interface PkcePair {
  verifier: string
  challenge: string
  method: 'S256'
}

/**
 * Generate a cryptographically random code verifier for PKCE
 */
export function generateCodeVerifier(): string {
  const bytes = crypto.randomBytes(CODE_VERIFIER_LENGTH)
  let result = ''
  for (let i = 0; i < CODE_VERIFIER_LENGTH; i++) {
    result += CODE_VERIFIER_CHARS[bytes[i] % CODE_VERIFIER_CHARS.length]
  }
  return result
}

/**
 * Generate a code challenge from a code verifier using S256 method
 * S256 method: BASE64URL(SHA256(ASCII(code_verifier)))
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hashBuffer = await crypto.subtle.digest('SHA256', data)
  return Buffer.from(hashBuffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generate a complete PKCE pair (verifier + challenge)
 */
export async function generatePkcePair(): Promise<PkcePair> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  return { verifier, challenge, method: 'S256' }
}

/**
 * Supported OAuth2 providers
 */
export type OAuth2Provider = 'google' | 'github' | 'microsoft' | 'local'

export interface OAuth2Config {
  provider: OAuth2Provider
  clientId: string
  clientSecret?: string
  authorizationUrl: string
  tokenUrl: string
  redirectUri: string
  scopes: string[]
}

export interface OAuth2TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope: string
}

export interface OAuth2UserInfo {
  sub: string
  email?: string
  name?: string
  picture?: string
  provider: OAuth2Provider
}

/**
 * Exchange authorization code for tokens with PKCE support
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  config: OAuth2Config
): Promise<OAuth2TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  })

  if (config.clientSecret) {
    params.set('client_secret', config.clientSecret)
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${error}`)
  }

  return response.json() as Promise<OAuth2TokenResponse>
}

/**
 * Fetch user info from OAuth2 provider
 */
export async function fetchUserInfo(
  accessToken: string,
  config: OAuth2Config
): Promise<OAuth2UserInfo> {
  // Provider-specific user info endpoints
  const userInfoUrls: Record<OAuth2Provider, string> = {
    google: 'https://www.googleapis.com/oauth2/v3/userinfo',
    github: 'https://api.github.com/user',
    microsoft: 'https://graph.microsoft.com/v1.0/me',
    local: '',
  }

  if (config.provider === 'local') {
    throw new Error('Local provider does not support user info fetch')
  }

  const response = await fetch(userInfoUrls[config.provider], {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.status}`)
  }

  const data = await response.json() as Record<string, unknown>

  // Normalize user info across providers
  return normalizeUserInfo(data, config.provider)
}

/**
 * Normalize user info from different OAuth2 providers to a common format
 */
function normalizeUserInfo(data: Record<string, unknown>, provider: OAuth2Provider): OAuth2UserInfo {
  switch (provider) {
    case 'google':
      return {
        sub: String(data.sub),
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        picture: data.picture as string | undefined,
        provider,
      }
    case 'github':
      return {
        sub: String(data.id),
        email: (data.email as string) || undefined,
        name: (data.name as string) || (data.login as string),
        picture: data.avatar_url as string | undefined,
        provider,
      }
    case 'microsoft':
      return {
        sub: data.id as string,
        email: data.mail as string | undefined,
        name: data.displayName as string | undefined,
        picture: undefined,
        provider,
      }
    default:
      return {
        sub: String(data.sub || data.id),
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        picture: data.picture as string | undefined,
        provider,
      }
  }
}

/**
 * Build authorization URL with PKCE parameters
 */
export function buildAuthorizationUrl(
  config: OAuth2Config,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${config.authorizationUrl}?${params.toString()}`
}

/**
 * Validate state parameter to prevent CSRF attacks
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function validateState(expected: string, received: string): boolean {
  if (!expected || !received) return false
  // Use timing-safe comparison
  if (expected.length !== received.length) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  return crypto.timingSafeEqual(a, b)
}
