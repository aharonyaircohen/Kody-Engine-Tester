function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

/**
 * Checks if a JWT token is expired by decoding it and examining the `exp` claim.
 * Does NOT verify the token signature - use JwtService.verify() for full verification.
 *
 * @param token - A JWT token string (header.body.signature format)
 * @returns true if the token is expired or has an invalid format, false if not expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return true // Invalid format => treat as expired
    }

    const payload = JSON.parse(base64urlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    // If no exp claim, treat as not expired
    if (typeof payload.exp !== 'number') {
      return false
    }

    return payload.exp < now
  } catch {
    return true // Decode failure => treat as expired
  }
}