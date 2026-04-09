import crypto from 'crypto'

export interface Session {
  id: string
  userId: string
  token: string
  refreshToken: string
  expiresAt: Date
  refreshExpiresAt: Date
  ipAddress: string
  userAgent: string
  createdAt: Date
  generation: number
}

const MAX_SESSIONS_PER_USER = 5
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export class SessionStore {
  private sessions = new Map<string, Session>()
  private tokenIndex = new Map<string, string>() // token -> sessionId
  private refreshTokenIndex = new Map<string, string>() // refreshToken -> sessionId

  create(userId: string, token: string, refreshToken: string, ipAddress: string, userAgent: string): Session {
    this.enforceMaxSessions(userId)

    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      ipAddress,
      userAgent,
      createdAt: new Date(),
      generation: 0,
    }

    this.sessions.set(session.id, session)
    this.tokenIndex.set(token, session.id)
    this.refreshTokenIndex.set(refreshToken, session.id)
    return session
  }

  private enforceMaxSessions(userId: string): void {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    while (userSessions.length >= MAX_SESSIONS_PER_USER) {
      const oldest = userSessions.shift()!
      this.revoke(oldest.id)
    }
  }

  findByToken(token: string): Session | undefined {
    const sessionId = this.tokenIndex.get(token)
    if (!sessionId) return undefined
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    if (session.expiresAt <= new Date()) return undefined
    return session
  }

  findByRefreshToken(refreshToken: string): Session | undefined {
    const sessionId = this.refreshTokenIndex.get(refreshToken)
    if (!sessionId) return undefined
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    if (session.refreshExpiresAt <= new Date()) return undefined
    return session
  }

  refresh(sessionId: string, newToken: string, newRefreshToken: string): Session | undefined {
    const session = this.sessions.get(sessionId)
    if (!session) return undefined

    this.tokenIndex.delete(session.token)
    this.refreshTokenIndex.delete(session.refreshToken)

    const updated: Session = {
      ...session,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      generation: session.generation + 1,
    }

    this.sessions.set(sessionId, updated)
    this.tokenIndex.set(newToken, sessionId)
    this.refreshTokenIndex.set(newRefreshToken, sessionId)
    return updated
  }

  revoke(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    this.tokenIndex.delete(session.token)
    this.refreshTokenIndex.delete(session.refreshToken)
    this.sessions.delete(sessionId)
  }

  revokeAllForUser(userId: string): void {
    for (const session of Array.from(this.sessions.values())) {
      if (session.userId === userId) {
        this.revoke(session.id)
      }
    }
  }

  getGeneration(sessionId: string): number | undefined {
    const session = this.sessions.get(sessionId)
    return session?.generation
  }

  cleanup(): void {
    const now = new Date()
    for (const session of Array.from(this.sessions.values())) {
      if (session.expiresAt <= now && session.refreshExpiresAt <= now) {
        this.revoke(session.id)
      }
    }
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values())
  }
}
