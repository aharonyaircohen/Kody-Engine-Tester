/**
 * Token revocation using tokenVersion-based invalidation.
 *
 * Instead of maintaining a blacklist of revoked tokens, we increment a
 * tokenVersion counter on the user record. All valid tokens carry the
 * user's current tokenVersion in the generation field.
 *
 * When a token is verified, we check if token.generation >= stored tokenVersion.
 * If generation < tokenVersion, the token has been revoked.
 *
 * This approach:
 * - Requires no blacklist storage
 * - Automatically invalidates all tokens when tokenVersion increments
 * - Works at scale without cleanup overhead
 */

export interface RevokeTokenInput {
  userId: string
  incrementTokenVersion: (userId: string) => Promise<number>
}

export interface RevokeTokenResult {
  userId: string
  newTokenVersion: number
}

/**
 * Revokes all tokens for a user by incrementing their tokenVersion.
 * Any existing tokens will become invalid because their generation
 * will be less than the new tokenVersion.
 */
export async function revokeToken(input: RevokeTokenInput): Promise<RevokeTokenResult> {
  const { userId, incrementTokenVersion } = input

  if (!userId) {
    throw new Error('User ID is required')
  }

  const newTokenVersion = await incrementTokenVersion(userId)

  return {
    userId,
    newTokenVersion,
  }
}

/**
 * Revokes tokens for a user on all devices by incrementing tokenVersion.
 * This is used during logout or security events (e.g., password change).
 */
export async function revokeAllUserTokens(
  userId: string,
  incrementTokenVersion: (userId: string) => Promise<number>
): Promise<RevokeTokenResult> {
  return revokeToken({ userId, incrementTokenVersion })
}