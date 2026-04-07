/**
 * JWT token utility functions
 */

function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

/**
 * Checks if a JWT token is expired by decoding the payload and comparing
 * the `exp` claim against the current timestamp.
 *
 * @param token - A JWT string (header.payload.signature format)
 * @returns true if the token is expired or the token is malformed; false if the token is valid and not expired
 */
export function isTokenExpired(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return true // malformed token treated as expired
  }

  try {
    const payload = JSON.parse(base64urlDecode(parts[1])) as { exp?: number }
    if (typeof payload.exp !== 'number') {
      return true // missing exp claim treated as expired
    }

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true // decode/parse failure treated as expired
  }
}
