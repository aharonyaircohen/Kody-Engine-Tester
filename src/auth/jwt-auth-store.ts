export type RbacRole = 'admin' | 'editor' | 'viewer'

export interface StoredToken {
  userId: string
  token: string
  refreshToken: string
  expiresAt: Date
  refreshExpiresAt: Date
  generation: number
  createdAt: Date
}

const MAX_TOKENS_PER_USER = 5
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export class JwtAuthStore {
  private tokens = new Map<string, StoredToken>()
  private tokenIndex = new Map<string, string>() // token -> id
  private refreshTokenIndex = new Map<string, string>() // refreshToken -> id

  create(userId: string, token: string, refreshToken: string): StoredToken {
    this.enforceMaxTokens(userId)

    const stored: StoredToken = {
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      generation: 0,
      createdAt: new Date(),
    }

    this.tokens.set(stored.token, stored)
    this.tokenIndex.set(token, stored.token)
    this.refreshTokenIndex.set(refreshToken, stored.token)
    return stored
  }

  private enforceMaxTokens(userId: string): void {
    const userTokens = Array.from(this.tokens.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    while (userTokens.length >= MAX_TOKENS_PER_USER) {
      const oldest = userTokens.shift()!
      this.revoke(oldest.token)
    }
  }

  findByToken(token: string): StoredToken | undefined {
    const id = this.tokenIndex.get(token)
    if (!id) return undefined
    const stored = this.tokens.get(id)
    if (!stored) return undefined
    if (stored.expiresAt <= new Date()) return undefined
    return stored
  }

  findByRefreshToken(refreshToken: string): StoredToken | undefined {
    const id = this.refreshTokenIndex.get(refreshToken)
    if (!id) return undefined
    const stored = this.tokens.get(id)
    if (!stored) return undefined
    if (stored.refreshExpiresAt <= new Date()) return undefined
    return stored
  }

  refresh(token: string, newToken: string, newRefreshToken: string): StoredToken | undefined {
    const stored = this.tokens.get(token)
    if (!stored) return undefined

    this.tokenIndex.delete(stored.token)
    this.refreshTokenIndex.delete(stored.refreshToken)

    const updated: StoredToken = {
      ...stored,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      generation: stored.generation + 1,
    }

    this.tokens.set(token, updated)
    this.tokenIndex.set(newToken, token)
    this.refreshTokenIndex.set(newRefreshToken, token)
    return updated
  }

  /**
   * Update token values without incrementing generation.
   * Used during initial login to replace temp tokens with actual tokens.
   */
  updateTokens(oldToken: string, newToken: string, newRefreshToken: string): StoredToken | undefined {
    const stored = this.tokens.get(oldToken)
    if (!stored) return undefined

    this.tokenIndex.delete(stored.token)
    this.refreshTokenIndex.delete(stored.refreshToken)

    const updated: StoredToken = {
      ...stored,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      // Note: generation stays the same for initial token setup
    }

    this.tokens.delete(oldToken)
    this.tokens.set(newToken, updated)
    this.tokenIndex.set(newToken, newToken)
    this.refreshTokenIndex.set(newRefreshToken, newToken)
    return updated
  }

  revoke(token: string): void {
    const stored = this.tokens.get(token)
    if (!stored) return
    this.tokenIndex.delete(stored.token)
    this.refreshTokenIndex.delete(stored.refreshToken)
    this.tokens.delete(token)
  }

  revokeAllForUser(userId: string): void {
    for (const stored of Array.from(this.tokens.values())) {
      if (stored.userId === userId) {
        this.revoke(stored.token)
      }
    }
  }

  getGeneration(token: string): number | undefined {
    const stored = this.tokens.get(token)
    return stored?.generation
  }

  cleanup(): void {
    const now = new Date()
    for (const stored of Array.from(this.tokens.values())) {
      if (stored.expiresAt <= now && stored.refreshExpiresAt <= now) {
        this.revoke(stored.token)
      }
    }
  }
}