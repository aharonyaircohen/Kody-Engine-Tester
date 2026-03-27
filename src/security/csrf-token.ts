export interface CsrfTokenConfig {
  ttlMs?: number
}

export interface TokenEntry {
  token: string
  expiresAt: number
  sessionId: string
}

export interface ValidateResult {
  valid: boolean
  error?: string
  newToken?: string
}

export class CsrfTokenService {
  private store = new Map<string, TokenEntry>()
  private ttlMs: number

  constructor(config: CsrfTokenConfig = {}) {
    this.ttlMs = config.ttlMs ?? 30 * 60 * 1000 // 30 minutes default
  }

  /**
   * Generate a cryptographically random CSRF token for a given session ID.
   */
  async generate(sessionId: string): Promise<string> {
    const token = await this.buildToken()
    const expiresAt = Date.now() + this.ttlMs

    // Remove any existing token for this session
    this.store.set(sessionId, { token, expiresAt, sessionId })

    return token
  }

  /**
   * Validate a token for a given session ID.
   * - Checks token exists for session
   * - Checks token has not expired
   * - Deletes token after validation (single-use)
   * - Returns a new token (rotation) if valid
   */
  async validate(sessionId: string, token: string): Promise<ValidateResult> {
    const entry = this.store.get(sessionId)

    if (!entry) {
      return { valid: false, error: 'CSRF token not found' }
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(sessionId)
      return { valid: false, error: 'CSRF token expired' }
    }

    if (entry.token !== token) {
      return { valid: false, error: 'Invalid CSRF token' }
    }

    // Single-use: delete after validation
    this.store.delete(sessionId)

    // Token rotation: generate a new token
    const newToken = await this.buildToken()
    const expiresAt = Date.now() + this.ttlMs
    this.store.set(sessionId, { token: newToken, expiresAt, sessionId })

    return { valid: true, newToken }
  }

  /**
   * Remove a token for a given session ID.
   */
  revoke(sessionId: string): void {
    this.store.delete(sessionId)
  }

  /**
   * Remove all expired tokens from the store.
   */
  cleanup(): void {
    const now = Date.now()
    for (const [sessionId, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(sessionId)
      }
    }
  }

  /**
   * Get the number of active tokens in the store.
   */
  get size(): number {
    return this.store.size
  }

  private async buildToken(): Promise<string> {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

// Default singleton instance
let defaultInstance: CsrfTokenService | null = null

export function getCsrfTokenService(): CsrfTokenService {
  if (!defaultInstance) {
    defaultInstance = new CsrfTokenService()
  }
  return defaultInstance
}

export function resetCsrfTokenService(): void {
  defaultInstance = null
}
