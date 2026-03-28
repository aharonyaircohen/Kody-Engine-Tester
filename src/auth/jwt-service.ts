export type UserRole = 'admin' | 'user' | 'guest' | 'student' | 'instructor'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
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

export class JwtService {
  private secret: string
  private blacklistedTokens = new Map<string, number>() // token -> exp timestamp

  constructor(secret: string = 'dev-secret-do-not-use-in-production') {
    this.secret = secret
  }

  private async getKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    return crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
  }

  async sign(payload: TokenInput, expiresInMs: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const fullPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + Math.floor(expiresInMs / 1000),
    }

    const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = base64urlEncode(JSON.stringify(fullPayload))
    const signingInput = `${header}.${body}`

    const key = await this.getKey()
    const encoder = new TextEncoder()
    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput))
    const sig = Buffer.from(sigBuffer).toString('base64url')

    return `${signingInput}.${sig}`
  }

  async verify(token: string): Promise<TokenPayload> {
    if (this.blacklistedTokens.has(token)) {
      throw new Error('Token revoked')
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const [header, body, sig] = parts
    const signingInput = `${header}.${body}`

    const key = await this.getKey()
    const encoder = new TextEncoder()
    const sigBuffer = Buffer.from(sig, 'base64url')
    const valid = await crypto.subtle.verify('HMAC', key, sigBuffer, encoder.encode(signingInput))

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

  blacklist(token: string): void {
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload: TokenPayload = JSON.parse(base64urlDecode(parts[1]))
        this.blacklistedTokens.set(token, payload.exp)
      }
    } catch {
      this.blacklistedTokens.set(token, 0)
    }
  }

  cleanupBlacklist(): void {
    const now = Math.floor(Date.now() / 1000)
    for (const [token, exp] of this.blacklistedTokens.entries()) {
      if (exp < now) {
        this.blacklistedTokens.delete(token)
      }
    }
  }
}
