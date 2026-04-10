import type { RbacRole } from './auth-service'

export interface TokenPayload {
  userId: string
  email: string
  role: RbacRole
  sessionId: string
  generation: number
  iat: number
  exp: number
}

type TokenInput = Omit<TokenPayload, 'iat' | 'exp'>

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString('base64url')
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

export interface JwtServiceV2Options {
  privateKey?: string // Base64-encoded PEM
  publicKey?: string // Base64-encoded PEM
  migrationMode?: boolean
}

/**
 * JWT Service v2 using RS256 (RSA-PKCS1-v1_5 with SHA-256)
 *
 * This service uses RSA key pairs instead of HMAC secrets for signing.
 * During migration from HS256 (v1), both algorithms are supported via dualVerify.
 */
export class JwtServiceV2 {
  private privateKey: CryptoKey | null = null
  private publicKey: CryptoKey | null = null
  private readonly _migrationMode: boolean
  private readonly _providedPrivateKey: string | undefined
  private readonly _providedPublicKey: string | undefined

  constructor(options: JwtServiceV2Options = {}) {
    this._migrationMode = options.migrationMode ?? false
    this._providedPrivateKey = options.privateKey
    this._providedPublicKey = options.publicKey
  }

  isMigrationMode(): boolean {
    return this._migrationMode
  }

  /**
   * Get the public key for verification
   */
  async getPublicKey(): Promise<CryptoKey> {
    if (this.publicKey) {
      return this.publicKey
    }

    // If keys were provided via constructor options, import them
    if (this._providedPublicKey) {
      this.publicKey = await this.importPublicKey(this._providedPublicKey)
      return this.publicKey
    }

    // If keys were provided via environment, import them
    const publicKeyPem = process.env.JWT_V2_PUBLIC_KEY
    if (publicKeyPem) {
      this.publicKey = await this.importPublicKey(publicKeyPem)
      return this.publicKey
    }

    // Generate a new key pair
    const keyPair = await this.generateKeyPair()
    this.privateKey = keyPair.privateKey
    this.publicKey = keyPair.publicKey

    return this.publicKey
  }

  /**
   * Get the private key for signing
   */
  private async getPrivateKey(): Promise<CryptoKey> {
    if (this.privateKey) {
      return this.privateKey
    }

    // If keys were provided via constructor options, import them
    if (this._providedPrivateKey) {
      this.privateKey = await this.importPrivateKey(this._providedPrivateKey)
      return this.privateKey
    }

    // If keys were provided via environment, import them
    const privateKeyPem = process.env.JWT_V2_PRIVATE_KEY
    if (privateKeyPem) {
      this.privateKey = await this.importPrivateKey(privateKeyPem)
      return this.privateKey
    }

    // Generate a new key pair
    const keyPair = await this.generateKeyPair()
    this.privateKey = keyPair.privateKey
    this.publicKey = keyPair.publicKey

    return this.privateKey
  }

  /**
   * Generate a new RSA key pair for RS256 signing
   */
  private async generateKeyPair(): Promise<CryptoKeyPair> {
    return crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify']
    )
  }

  /**
   * Import an RSA public key from PEM base64
   */
  private async importPublicKey(pem: string): Promise<CryptoKey> {
    const keyData = Buffer.from(pem, 'base64')
    return crypto.subtle.importKey(
      'spki',
      keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      true,
      ['verify']
    )
  }

  /**
   * Import an RSA private key from PEM base64
   */
  private async importPrivateKey(pem: string): Promise<CryptoKey> {
    const keyData = Buffer.from(pem, 'base64')
    return crypto.subtle.importKey(
      'pkcs8',
      keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      true,
      ['sign']
    )
  }

  async sign(payload: TokenInput, expiresInMs: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const fullPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + Math.floor(expiresInMs / 1000),
    }

    const header = base64urlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const body = base64urlEncode(JSON.stringify(fullPayload))
    const signingInput = `${header}.${body}`

    const privateKey = await this.getPrivateKey()
    const encoder = new TextEncoder()
    const sigBuffer = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, privateKey, encoder.encode(signingInput))
    const sig = Buffer.from(sigBuffer).toString('base64url')

    return `${signingInput}.${sig}`
  }

  async verify(token: string): Promise<TokenPayload> {
    const blacklistedTokens = (this as unknown as { _blacklist?: Map<string, number> })._blacklist
    if (blacklistedTokens?.has(token)) {
      throw new Error('Token revoked')
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const [header, body, sig] = parts
    const signingInput = `${header}.${body}`

    const publicKey = await this.getPublicKey()
    const encoder = new TextEncoder()
    const sigBuffer = Buffer.from(sig, 'base64url')

    let valid = false
    try {
      valid = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, publicKey, sigBuffer, encoder.encode(signingInput))
    } catch {
      valid = false
    }

    if (!valid) {
      throw new Error('Invalid token signature')
    }

    const payload: TokenPayload = JSON.parse(base64urlDecode(body))
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp < now) {
      throw new Error('Token expired')
    }

    return payload
  }

  async signAccessToken(payload: TokenInput): Promise<string> {
    return this.sign({ ...payload, generation: payload.generation ?? 0 }, 15 * 60 * 1000) // 15 minutes
  }

  async signRefreshToken(payload: TokenInput): Promise<string> {
    return this.sign({ ...payload, generation: payload.generation ?? 0 }, 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  /**
   * Blacklist a token by adding it to the blacklist map
   */
  blacklist(token: string): void {
    const blacklistedTokens = this.getBlacklistMap()
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload: TokenPayload = JSON.parse(base64urlDecode(parts[1]))
        blacklistedTokens.set(token, payload.exp)
      } else {
        blacklistedTokens.set(token, 0)
      }
    } catch {
      blacklistedTokens.set(token, 0)
    }
  }

  /**
   * Remove expired tokens from the blacklist
   */
  cleanupBlacklist(): void {
    const blacklistedTokens = this.getBlacklistMap()
    const now = Math.floor(Date.now() / 1000)
    for (const [token, exp] of blacklistedTokens.entries()) {
      if (exp < now) {
        blacklistedTokens.delete(token)
      }
    }
  }

  private getBlacklistMap(): Map<string, number> {
    const service = this as unknown as { _blacklist?: Map<string, number> }
    if (!service._blacklist) {
      service._blacklist = new Map<string, number>()
    }
    return service._blacklist
  }

  /**
   * Check if a token is an RS256 token by inspecting the header
   */
  isRs256Token(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }
      const header = JSON.parse(base64urlDecode(parts[0]))
      return header.alg === 'RS256'
    } catch {
      return false
    }
  }
}

// Module-level singleton for backward compatibility
let jwtServiceV2Instance: JwtServiceV2 | null = null

export function getJwtServiceV2(): JwtServiceV2 {
  if (!jwtServiceV2Instance) {
    jwtServiceV2Instance = new JwtServiceV2({
      privateKey: process.env.JWT_V2_PRIVATE_KEY,
      publicKey: process.env.JWT_V2_PUBLIC_KEY,
      migrationMode: process.env.AUTH_MODE === 'dual',
    })
  }
  return jwtServiceV2Instance
}
