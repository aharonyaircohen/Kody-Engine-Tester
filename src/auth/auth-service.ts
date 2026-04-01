import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'
import { JwtService } from './jwt-service'

export type RbacRole = 'admin' | 'editor' | 'viewer'

export interface AuthenticatedUser {
  id: number | string
  email: string
  role: RbacRole
  firstName?: string
  lastName?: string
  isActive: boolean
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: {
    id: number | string
    email: string
    role: RbacRole
  }
}

export interface TokenFields {
  refreshToken: string | null
  tokenExpiresAt: Date | null
  lastTokenUsedAt: Date | null
}

const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

export class AuthService {
  constructor(
    private payload: Payload,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    _password: string,
    _ipAddress: string,
    _userAgent: string
  ): Promise<AuthResult> {
    if (!email) {
      throw createError('Email is required', 400)
    }

    const users = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { email: { equals: email } },
      limit: 1,
    })
    const user = users.docs[0]

    if (!user) {
      throw createError('Invalid credentials', 401)
    }

    const userId = (user as any).id
    const role = (user as any).role as RbacRole
    const isActive = (user as any).isActive ?? true

    if (!isActive) {
      throw createError('Account is inactive', 403)
    }

    // Generate tokens
    const tokenPayload = {
      userId: String(userId),
      email,
      role,
      sessionId: `session-${userId}-${Date.now()}`,
      generation: 0,
    }

    const accessToken = await this.jwtService.signAccessToken(tokenPayload)
    const refreshToken = await this.jwtService.signRefreshToken(tokenPayload)

    // Calculate expiry
    const tokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)

    // Update user with token fields
    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: userId,
      data: {
        refreshToken,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
        lastTokenUsedAt: new Date().toISOString(),
      } as any,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role,
      },
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw createError('Refresh token is required', 400)
    }

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number }
    try {
      payload = await this.jwtService.verify(refreshToken) as any
    } catch {
      throw createError('Invalid or expired refresh token', 401)
    }

    // Find user and verify stored refresh token matches
    const users = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: payload.userId } },
      limit: 1,
    })
    const user = users.docs[0]

    if (!user) {
      throw createError('User not found', 404)
    }

    const storedRefreshToken = (user as any).refreshToken as string | null
    const tokenExpiresAt = (user as any).tokenExpiresAt as string | null

    // Verify refresh token matches and is not expired
    if (storedRefreshToken !== refreshToken) {
      throw createError('Invalid refresh token', 401)
    }

    if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
      throw createError('Refresh token expired', 401)
    }

    // Generate new tokens with incremented generation
    const newPayload = {
      ...payload,
      generation: payload.generation + 1,
    }

    const newAccessToken = await this.jwtService.signAccessToken(newPayload)
    const newRefreshToken = await this.jwtService.signRefreshToken(newPayload)

    // Update stored refresh token (rotation)
    const newTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS)

    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: payload.userId,
      data: {
        refreshToken: newRefreshToken,
        tokenExpiresAt: newTokenExpiresAt.toISOString(),
        lastTokenUsedAt: new Date().toISOString(),
      } as any,
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async verifyAccessToken(accessToken: string): Promise<{ user?: AuthenticatedUser }> {
    if (!accessToken) {
      throw createError('Access token is required', 401)
    }

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number }
    try {
      payload = await this.jwtService.verify(accessToken) as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid access token'
      throw createError(message, 401)
    }

    const userResults = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: payload.userId } },
      limit: 1,
    })
    const user = userResults.docs[0]

    if (!user) {
      throw createError('User not found', 404)
    }

    const isActive = (user as any).isActive ?? true
    if (!isActive) {
      throw createError('Account is inactive', 403)
    }

    return {
      user: {
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role as RbacRole,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        isActive,
      },
    }
  }

  async logout(userId: number | string): Promise<void> {
    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: userId,
      data: {
        refreshToken: null,
      } as any,
    })
  }
}
