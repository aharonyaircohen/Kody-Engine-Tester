export type RbacRole = 'admin' | 'editor' | 'viewer'

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

export class JwtService {
  private privateKey: CryptoKey | null = null
  private publicKey: CryptoKey | null = null

  constructor(
    private privateKeyPem?: string,
    private publicKeyPem?: string
  ) {}

  private async getPrivateKey(): Promise<CryptoKey> {
    if (this.privateKey) return this.privateKey

    const pem = this.privateKeyPem ?? process.env.JWT_PRIVATE_KEY
    if (!pem) {
      throw new Error('JWT_PRIVATE_KEY environment variable is not set')
    }

    this.privateKey = await crypto.subtle.importKey(
      'pkcs8',
      this.pemToDer(pem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )
    return this.privateKey
  }

  private async getPublicKey(): Promise<CryptoKey> {
    if (this.publicKey) return this.publicKey

    const pem = this.publicKeyPem ?? process.env.JWT_PUBLIC_KEY
    if (!pem) {
      throw new Error('JWT_PUBLIC_KEY environment variable is not set')
    }

    this.publicKey = await crypto.subtle.importKey(
      'spki',
      this.pemToDer(pem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )
    return this.publicKey
  }

  // Convert PEM to DER (strip header/footer and decode base64)
  private pemToDer(pem: string): ArrayBuffer {
    const lines = pem.split('\n')
    const base64 = lines.filter(l => !l.startsWith('-----')).join('')
    const binary = Buffer.from(base64, 'base64')
    return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength)
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

    const key = await this.getPrivateKey()
    const encoder = new TextEncoder()
    const sigBuffer = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      encoder.encode(signingInput)
    )
    const sig = Buffer.from(sigBuffer).toString('base64url')

    return `${signingInput}.${sig}`
  }

  async verify(token: string): Promise<TokenPayload> {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const [header, body, sig] = parts
    const signingInput = `${header}.${body}`

    const key = await this.getPublicKey()
    const encoder = new TextEncoder()
    const sigBuffer = Buffer.from(sig, 'base64url')

    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      sigBuffer,
      encoder.encode(signingInput)
    )

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
    return this.sign({ ...payload, generation: payload.generation ?? 0 }, 15 * 60 * 1000)
  }

  async signRefreshToken(payload: TokenInput): Promise<string> {
    return this.sign({ ...payload, generation: payload.generation ?? 0 }, 7 * 24 * 60 * 60 * 1000)
  }
}