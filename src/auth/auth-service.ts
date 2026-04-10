import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'
import crypto from 'crypto'
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

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

/**
 * Verifies a password against a Payload-stored hash using PBKDF2.
 * Matches Payload's generatePasswordSaltHash algorithm: 25000 iterations, sha256, 512 bits.
 */
async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      const storedHashBuffer = Buffer.from(hash, 'hex')
      if (derivedKey.length === storedHashBuffer.length && crypto.timingSafeEqual(derivedKey, storedHashBuffer)) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

export class AuthService {
  constructor(
    private payload: Payload,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
    _ipAddress: string,
    _userAgent: string
  ): Promise<AuthResult> {
    if (!email) {
      throw createError('Email is required', 400)
    }

    if (!password) {
      throw createError('Password is required', 400)
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
    const hash = (user as any).hash as string | null | undefined
    const salt = (user as any).salt as string | null | undefined

    if (!isActive) {
      throw createError('Account is inactive', 403)
    }

    // Verify password against stored hash
    if (!hash || !salt) {
      throw createError('Invalid credentials', 401)
    }

    const passwordValid = await verifyPassword(password, hash, salt)
    if (!passwordValid) {
      throw createError('Invalid credentials', 401)
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

    // Update user with token fields and lastLogin (actual login event)
    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: userId,
      data: {
        refreshToken,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
        lastTokenUsedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!newPassword) {
      throw createError('New password is required', 400)
    }

    const users = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: userId } },
      limit: 1,
    })
    const user = users.docs[0]
    if (!user) {
      throw createError('User not found', 404)
    }

    const hash = (user as any).hash as string | null
    const salt = (user as any).salt as string | null
    const passwordHistory = (user as any).passwordHistory as Array<{ hash: string; salt: string }> | null

    // Verify current password
    if (!hash || !salt) {
      throw createError('Invalid credentials', 401)
    }
    const currentValid = await verifyPassword(currentPassword, hash, salt)
    if (!currentValid) {
      throw createError('Current password is incorrect', 401)
    }

    // Check against password history (last 5)
    if (passwordHistory && passwordHistory.length > 0) {
      for (const entry of passwordHistory.slice(0, 5)) {
        const matches = await verifyPassword(newPassword, entry.hash, entry.salt)
        if (matches) {
          throw createError('Cannot reuse any of your last 5 passwords', 400)
        }
      }
    }

    // Generate new salt and hash for new password
    const newSalt = crypto.randomBytes(16).toString('hex')
    const newHash = await new Promise<string>((resolve, reject) => {
      crypto.pbkdf2(newPassword, newSalt, 25000, 512, 'sha256', (err, derivedKey) => {
        if (err) reject(err)
        else resolve(Buffer.from(derivedKey).toString('hex'))
      })
    })

    // Update password history - add current, keep last 5
    const updatedHistory = [
      { hash, salt, changedAt: new Date() },
      ...(passwordHistory || []),
    ].slice(0, 5)

    // Update user with new password and history
    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: userId,
      data: {
        hash: newHash,
        salt: newSalt,
        passwordHistory: updatedHistory,
      } as any,
    })
  }
}
