import type { UserStore } from './user-store'
import type { SessionStore } from './session-store'
import type { JwtService } from './jwt-service'
import type { UserRole, LinkedAccount } from './user-store'
import type { OAuth2Provider, OAuth2UserInfo } from './oauth2'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: UserRole }
}

export interface LogoutOptions {
  allDevices?: boolean
}

export interface MeResult {
  id: string
  email: string
  role: UserRole
  createdAt: Date
  lastLoginAt?: Date
  isActive: boolean
  linkedAccounts?: LinkedAccount[]
}

class AuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

function createError(message: string, status: number): AuthError {
  return new AuthError(message, status)
}

export class AuthController {
  constructor(
    private userStore: UserStore,
    private sessionStore: SessionStore,
    private jwtService: JwtService
  ) {}

  async login(
    credentials: LoginCredentials,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthResult> {
    const { email, password } = credentials

    if (!email || !password) {
      throw createError('Email and password are required', 400)
    }

    const user = await this.userStore.findByEmail(email)
    if (!user) {
      throw createError('Invalid credentials', 401)
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403)
    }

    if (this.userStore.isLocked(user)) {
      throw createError('Account is locked. Please try again later.', 423)
    }

    const valid = await this.userStore.verifyPassword(password, user.passwordHash, user.salt)
    if (!valid) {
      await this.userStore.recordFailedLogin(user.id)
      throw createError('Invalid credentials', 401)
    }

    await this.userStore.resetFailedAttempts(user.id)
    await this.userStore.update(user.id, { lastLoginAt: new Date() })

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: '',
      generation: 0,
    }

    const accessToken = await this.jwtService.signAccessToken(tokenPayload)
    const refreshToken = await this.jwtService.signRefreshToken(tokenPayload)

    const session = this.sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

    const finalAccessToken = await this.jwtService.signAccessToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    const finalRefreshToken = await this.jwtService.signRefreshToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    this.sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

    return {
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }

  logout(
    userId: string,
    sessionId: string,
    accessToken: string,
    options: LogoutOptions = {}
  ): void {
    const { allDevices = false } = options

    if (allDevices) {
      this.sessionStore.revokeAllForUser(userId)
    } else {
      this.sessionStore.revoke(sessionId)
    }

    this.jwtService.blacklist(accessToken)
  }

  async me(userId: string): Promise<MeResult> {
    const user = await this.userStore.findById(userId)
    if (!user) {
      throw createError('User not found', 404)
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      linkedAccounts: user.linkedAccounts ?? [],
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw createError('Refresh token is required', 400)
    }

    let payload
    try {
      payload = await this.jwtService.verify(refreshToken)
    } catch {
      throw createError('Invalid or expired refresh token', 401)
    }

    const session = this.sessionStore.findByRefreshToken(refreshToken)
    if (!session) {
      throw createError('Session not found or expired', 401)
    }

    const tokenInput = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: session.id,
      generation: session.generation + 1,
    }

    const newAccessToken = await this.jwtService.signAccessToken(tokenInput)
    const newRefreshToken = await this.jwtService.signRefreshToken(tokenInput)

    this.sessionStore.refresh(session.id, newAccessToken, newRefreshToken)
    this.jwtService.blacklist(refreshToken)

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async handleOAuthRegister(
    userInfo: OAuth2UserInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthResult> {
    const existingUser = await this.userStore.findByProvider(userInfo.provider, userInfo.providerId)
    if (existingUser) {
      throw createError('Provider account already registered', 409)
    }

    const user = await this.userStore.createOAuth({
      email: userInfo.email,
      provider: userInfo.provider,
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

    const accessToken = await this.jwtService.signAccessToken(tokenPayload)
    const refreshToken = await this.jwtService.signRefreshToken(tokenPayload)
    const session = this.sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

    const finalAccessToken = await this.jwtService.signAccessToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    const finalRefreshToken = await this.jwtService.signRefreshToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    this.sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

    return {
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }

  async handleOAuthLink(
    userId: string,
    userInfo: OAuth2UserInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthResult> {
    await this.userStore.linkAccount(userId, userInfo.provider, userInfo.providerId)

    const user = await this.userStore.findById(userId)
    if (!user) {
      throw createError('User not found', 404)
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: '',
      generation: 0,
    }

    const accessToken = await this.jwtService.signAccessToken(tokenPayload)
    const refreshToken = await this.jwtService.signRefreshToken(tokenPayload)
    const session = this.sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

    const finalAccessToken = await this.jwtService.signAccessToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    const finalRefreshToken = await this.jwtService.signRefreshToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    this.sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

    return {
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }

  async linkOAuthProvider(userId: string, provider: OAuth2Provider, providerId: string): Promise<void> {
    await this.userStore.linkAccount(userId, provider, providerId)
  }

  async unlinkOAuthProvider(userId: string, provider: OAuth2Provider): Promise<void> {
    const user = await this.userStore.findById(userId)
    if (!user) {
      throw createError('User not found', 404)
    }
    if (user.provider === provider) {
      throw createError('Cannot unlink primary provider', 400)
    }
    await this.userStore.unlinkAccount(userId, provider)
  }

  async getLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
    return this.userStore.getLinkedAccounts(userId)
  }

  async handleOAuthLogin(
    userInfo: OAuth2UserInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthResult> {
    const user = await this.userStore.findByProvider(userInfo.provider, userInfo.providerId)
    if (!user) {
      throw createError('Provider account not registered', 404)
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403)
    }

    await this.userStore.update(user.id, { lastLoginAt: new Date() })

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: '',
      generation: 0,
    }

    const accessToken = await this.jwtService.signAccessToken(tokenPayload)
    const refreshToken = await this.jwtService.signRefreshToken(tokenPayload)
    const session = this.sessionStore.create(user.id, accessToken, refreshToken, ipAddress, userAgent)

    const finalAccessToken = await this.jwtService.signAccessToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    const finalRefreshToken = await this.jwtService.signRefreshToken({
      ...tokenPayload,
      sessionId: session.id,
    })
    this.sessionStore.refresh(session.id, finalAccessToken, finalRefreshToken)

    return {
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }
}
