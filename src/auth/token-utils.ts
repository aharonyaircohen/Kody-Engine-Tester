function base64urlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

interface DecodedToken {
  exp: number
  iat: number
  [key: string]: unknown
}

/**
 * Checks if a JWT token is expired by decoding the payload and comparing
 * the `exp` claim against the current time.
 *
 * @param token - A JWT token string (header.payload.signature format)
 * @returns `true` if the token is expired or invalid, `false` otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return true
    }

    const payload: DecodedToken = JSON.parse(base64urlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    if (typeof payload.exp !== 'number') {
      return true
    }

    return payload.exp < now
  } catch {
    return true
  }
}