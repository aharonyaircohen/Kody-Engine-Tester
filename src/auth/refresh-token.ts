import type { JwtService, TokenPayload } from './jwt-service'

export interface RefreshTokenInput {
  refreshToken: string
  jwtService: JwtService
  getStoredTokenVersion: (userId: string) => Promise<number | null>
  updateUserToken: (userId: string, refreshToken: string, newTokenVersion: number) => Promise<void>
}

export interface RefreshTokenResult {
  accessToken: string
  refreshToken: string
  newTokenVersion: number
}

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

/**
 * Refreshes access and refresh tokens using tokenVersion-based invalidation.
 * Validates that the presented refreshToken matches the stored one and that
 * the tokenVersion has not been incremented (which would indicate all tokens
 * for this user have been revoked).
 */
export async function refreshToken(input: RefreshTokenInput): Promise<RefreshTokenResult> {
  const { refreshToken, jwtService, getStoredTokenVersion, updateUserToken } = input

  if (!refreshToken) {
    throw createError('Refresh token is required', 400)
  }

  let payload: TokenPayload
  try {
    payload = await jwtService.verify(refreshToken) as TokenPayload
  } catch {
    throw createError('Invalid or expired refresh token', 401)
  }

  // Get the user's current tokenVersion
  const storedTokenVersion = await getStoredTokenVersion(payload.userId)
  if (storedTokenVersion === null) {
    throw createError('User not found', 404)
  }

  // Check if tokenVersion has been incremented (indicates revocation)
  if (payload.generation < storedTokenVersion) {
    throw createError('Token has been revoked', 401)
  }

  // Generate new tokens with incremented generation
  const newPayload = {
    ...payload,
    generation: payload.generation + 1,
  }

  const accessToken = await jwtService.signAccessToken(newPayload)
  const newRefreshToken = await jwtService.signRefreshToken(newPayload)
  const newTokenVersion = storedTokenVersion

  // Update stored refresh token and last used timestamp
  await updateUserToken(payload.userId, newRefreshToken, newTokenVersion)

  return {
    accessToken,
    refreshToken: newRefreshToken,
    newTokenVersion,
  }
}