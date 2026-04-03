import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'
import crypto from 'crypto'
import { JwtService } from './jwt-service'
import type { OAuth2Provider, OAuth2UserInfo } from './oauth2-pkce'

export type RbacRole = 'admin' | 'editor' | 'viewer'

export interface TenantPermission {
  tenantId: string
  role: RbacRole
  grantedAt: string
  grantedBy?: string
}

export interface AuthenticatedUser {
  id: number | string
  email: string
  role: RbacRole
  firstName?: string
  lastName?: string
  isActive: boolean
  organization?: string
  tenantPermissions?: TenantPermission[]
  identities?: Array<{
    provider: OAuth2Provider
    providerId: string
    email?: string
    linkedAt: string
  }>
}

export interface TenantContext {
  tenantId: string
  role: RbacRole
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

    // Blacklist the old refresh token BEFORE generating new ones
    // This prevents race conditions where two concurrent refreshes both succeed
    this.jwtService.blacklist(refreshToken)

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

  async verifyAccessToken(accessToken: string, tenantId?: string): Promise<{ user?: AuthenticatedUser }> {
    if (!accessToken) {
      throw createError('Access token is required', 401)
    }

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number; tenantId?: string }
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

    // Get tenant permissions if tenantId is provided
    let tenantPermissions: TenantPermission[] | undefined
    const rawTenantPermissions = (user as any).tenantPermissions as Array<{
      tenantId: string
      role: string
      grantedAt: string
      grantedBy?: string
    }> | undefined

    if (rawTenantPermissions) {
      tenantPermissions = rawTenantPermissions.map(tp => ({
        tenantId: tp.tenantId,
        role: tp.role as RbacRole,
        grantedAt: tp.grantedAt,
        grantedBy: tp.grantedBy,
      }))
    }

    // If tenantId is provided, verify user has access to this tenant
    if (tenantId) {
      const hasAccess = this.checkTenantAccess(user, tenantId, tenantPermissions)
      if (!hasAccess) {
        throw createError('Access denied to this tenant', 403)
      }
    }

    return {
      user: {
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role as RbacRole,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        isActive,
        organization: (user as any).organization,
        tenantPermissions,
        identities: (user as any).identities,
      },
    }
  }

  /**
   * Check if user has access to a specific tenant
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private checkTenantAccess(user: any, tenantId: string, tenantPermissions?: TenantPermission[]): boolean {
    // User's primary organization
    const userOrg = user.organization as string | undefined
    if (userOrg === tenantId) return true

    // Check tenant permissions array
    if (tenantPermissions) {
      return tenantPermissions.some(tp => tp.tenantId === tenantId)
    }

    return false
  }

  /**
   * Get user's role for a specific tenant
   */
  getTenantRole(user: AuthenticatedUser, tenantId: string): RbacRole | null {
    // Primary organization role
    if (user.organization === tenantId) {
      return user.role
    }

    // Check tenant permissions
    if (user.tenantPermissions) {
      const permission = user.tenantPermissions.find(tp => tp.tenantId === tenantId)
      return permission?.role ?? null
    }

    return null
  }

  /**
   * Verify user has required role for a specific tenant
   */
  verifyTenantRole(user: AuthenticatedUser, tenantId: string, requiredRoles: RbacRole[]): boolean {
    const userRole = this.getTenantRole(user, tenantId)
    if (!userRole) return false
    return requiredRoles.includes(userRole)
  }

  /**
   * Authenticate via OAuth2 provider (PKCE flow)
   */
  async authenticateWithOAuth2(
    provider: OAuth2Provider,
    userInfo: OAuth2UserInfo,
    _codeVerifier: string,
    _ipAddress: string,
    _userAgent: string
  ): Promise<AuthResult> {
    // Find existing user by identity provider
    // Query by providerId which is unique per provider, then filter by provider
    // to avoid dot-notation issues with array fields in PayloadCMS
    const users = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: {
        'identities.providerId': { equals: userInfo.sub },
      },
      limit: 10, // Get a few results to filter
    })

    // Filter to find matching provider
    let user = users.docs.find((u) => {
      const identities = (u as any).identities || []
      return identities.some(
        (i: { provider: string; providerId: string }) =>
          i.provider === provider && i.providerId === userInfo.sub
      )
    })

    if (!user) {
      // Check if email exists - if so, link identity
      if (userInfo.email) {
        const existingByEmail = await this.payload.find({
          collection: 'users' as CollectionSlug,
          where: { email: { equals: userInfo.email } },
          limit: 1,
        })

        if (existingByEmail.docs[0]) {
          // Link identity to existing user
          const existingUser = existingByEmail.docs[0]
          const identities = (existingUser as any).identities || []
          identities.push({
            provider,
            providerId: userInfo.sub,
            email: userInfo.email,
            linkedAt: new Date().toISOString(),
          })

          await this.payload.update({
            collection: 'users' as CollectionSlug,
            id: (existingUser as any).id,
            data: { identities } as any,
          })

          user = existingUser
        }
      }

      // Create new user if no existing user found
      if (!user) {
        const nameParts = userInfo.name?.split(' ') ?? []
        const newUser = await this.payload.create({
          collection: 'users' as CollectionSlug,
          data: {
            email: userInfo.email || `${provider}:${userInfo.sub}@placeholder.local`,
            firstName: nameParts[0] || userInfo.name || 'Unknown',
            lastName: nameParts.slice(1).join(' ') || provider,
            role: 'viewer' as const,
            isActive: true,
            identities: [{
              provider,
              providerId: userInfo.sub,
              email: userInfo.email,
              linkedAt: new Date().toISOString(),
            }],
          } as any,
        })
        user = newUser
      }
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
      email: userInfo.email || (user as any).email,
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
        email: userInfo.email || (user as any).email,
        role,
      },
    }
  }

  /**
   * Link an OAuth2 identity to an existing user
   */
  async linkIdentity(
    userId: number | string,
    provider: OAuth2Provider,
    providerId: string,
    email?: string
  ): Promise<void> {
    const users = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: String(userId) } },
      limit: 1,
    })

    const user = users.docs[0]
    if (!user) {
      throw createError('User not found', 404)
    }

    const identities = ((user as any).identities || []).filter(
      (i: { provider: string; providerId: string }) =>
        !(i.provider === provider && i.providerId === providerId)
    )

    // Add new identity
    identities.push({
      provider,
      providerId,
      email,
      linkedAt: new Date().toISOString(),
    })

    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: userId,
      data: { identities } as any,
    })
  }

  /**
   * Grant tenant permissions to a user
   */
  async grantTenantPermission(
    adminUserId: number | string,
    targetUserId: number | string,
    tenantId: string,
    role: RbacRole
  ): Promise<void> {
    // Verify admin has permission to grant
    const admin = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: String(adminUserId) } },
      limit: 1,
    })

    if (!admin.docs[0]) {
      throw createError('Admin user not found', 404)
    }

    const adminRole = (admin.docs[0] as any).role as RbacRole
    if (adminRole !== 'admin') {
      throw createError('Only admins can grant tenant permissions', 403)
    }

    const target = await this.payload.find({
      collection: 'users' as CollectionSlug,
      where: { id: { equals: String(targetUserId) } },
      limit: 1,
    })

    if (!target.docs[0]) {
      throw createError('Target user not found', 404)
    }

    // Filter out existing permission for this tenant and add new one
    const existingTenantPermissions = ((target.docs[0] as any).tenantPermissions || []).filter(
      (tp: { tenantId: string }) => tp.tenantId !== tenantId
    )

    const newTenantPermissions = [
      ...existingTenantPermissions,
      {
        tenantId,
        role,
        grantedAt: new Date().toISOString(),
        grantedBy: String(adminUserId),
      },
    ]

    await this.payload.update({
      collection: 'users' as CollectionSlug,
      id: targetUserId,
      data: { tenantPermissions: newTenantPermissions } as any,
    })
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
